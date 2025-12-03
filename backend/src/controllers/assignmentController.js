const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const Section = require('../models/Section');
const Course = require('../models/Course');

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { sectionId, title, description, instructions, dueDate, questions, passingScore, totalPoints, allowLateSubmission, latePenalty } = req.body;
    
    if (!sectionId || !title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: sectionId, title, questions' });
    }

    const section = await Section.findById(sectionId).populate('course');
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Verify instructor owns the course
    if (section.course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to create assignment in this section' });
    }

    const totalPts = totalPoints || questions.reduce((sum, q) => sum + (q.points || 10), 0);

    const assignment = new Assignment({
      section: sectionId,
      course: section.course._id,
      instructor: req.user._id,
      title,
      description,
      instructions,
      dueDate,
      questions,
      passingScore: passingScore || 60,
      totalPoints: totalPts,
      allowLateSubmission: allowLateSubmission || false,
      latePenalty: latePenalty || 10,
      isPublished: false
    });

    await assignment.save();

    // Add assignment to section
    await Section.findByIdAndUpdate(sectionId, { $push: { assignments: assignment._id } });

    res.status(201).json(assignment);
  } catch (err) {
    console.error('Create assignment error:', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

// Get assignments by section
exports.getAssignmentsBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const assignments = await Assignment.find({ section: sectionId })
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    console.error('Get assignments error:', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

// Get single assignment
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId)
      .populate('instructor', 'name email');
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (err) {
    console.error('Get assignment error:', err);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
};

// Update assignment (instructor only)
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify instructor
    if (assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this assignment' });
    }

    // Don't allow updates if submissions exist
    const submissionCount = await AssignmentSubmission.countDocuments({ assignment: assignment._id });
    if (submissionCount > 0) {
      return res.status(400).json({ error: 'Cannot update assignment after students have submitted' });
    }

    const { title, description, instructions, dueDate, questions, passingScore, totalPoints, allowLateSubmission, latePenalty, isPublished } = req.body;

    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (instructions) assignment.instructions = instructions;
    if (dueDate) assignment.dueDate = dueDate;
    if (questions) assignment.questions = questions;
    if (passingScore) assignment.passingScore = passingScore;
    if (totalPoints) assignment.totalPoints = totalPoints;
    if (allowLateSubmission !== undefined) assignment.allowLateSubmission = allowLateSubmission;
    if (latePenalty) assignment.latePenalty = latePenalty;
    if (isPublished !== undefined) assignment.isPublished = isPublished;

    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error('Update assignment error:', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify instructor
    if (assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this assignment' });
    }

    // Remove from section
    await Section.updateOne({ _id: assignment.section }, { $pull: { assignments: assignment._id } });

    // Delete all submissions
    await AssignmentSubmission.deleteMany({ assignment: assignment._id });

    await Assignment.findByIdAndDelete(req.params.assignmentId);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('Delete assignment error:', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

// Submit or save assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers, isSubmit } = req.body; // isSubmit: true to finalize, false to save as draft

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if student is enrolled
    const course = await Course.findById(assignment.course);
    const isEnrolled = course.enrolledStudents.includes(req.user._id);
    if (!isEnrolled) {
      return res.status(403).json({ error: 'Not enrolled in course' });
    }

    // Find or create submission
    let submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: req.user._id
    });

    if (!submission) {
      submission = new AssignmentSubmission({
        assignment: assignmentId,
        student: req.user._id,
        course: assignment.course,
        maxPoints: assignment.totalPoints,
        answers: []
      });
    }

    // Update answers
    if (answers) {
      submission.answers = answers.map(ans => ({
        questionId: ans.questionId,
        questionType: ans.questionType,
        answer: ans.answer,
        pointsEarned: 0 // Will be set during grading
      }));
    }

    // Check due date and late submission
    const now = new Date();
    if (assignment.dueDate && now > assignment.dueDate) {
      submission.isLateSubmission = true;
    }

    if (isSubmit) {
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      
      // Auto-grade MCQ questions
      const autoGradedPoints = await autoGradeMCQ(submission, assignment);
      submission.totalPointsEarned = autoGradedPoints;
      submission.scorePercentage = (autoGradedPoints / assignment.totalPoints) * 100;
      
      // If all questions are MCQ, mark as graded
      const allMCQ = assignment.questions.every(q => q.type === 'mcq');
      if (allMCQ) {
        submission.status = 'graded';
        submission.gradedAt = new Date();
      }
    } else {
      submission.status = 'draft';
    }

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error('Submit assignment error:', err);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

// Auto-grade MCQ questions
async function autoGradeMCQ(submission, assignment) {
  let points = 0;
  submission.answers.forEach(ans => {
    const question = assignment.questions.find(q => q._id.toString() === ans.questionId.toString());
    if (question && question.type === 'mcq') {
      const selectedOption = question.options.find(opt => opt.text === ans.answer);
      if (selectedOption && selectedOption.isCorrect) {
        ans.isCorrect = true;
        ans.pointsEarned = question.points;
        points += question.points;
      } else {
        ans.isCorrect = false;
        ans.pointsEarned = 0;
      }
    }
  });
  return points;
}

// Grade assignment (instructor)
exports.gradeAssignment = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grades, feedback, totalPointsEarned } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate('assignment');
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Verify instructor
    if (submission.assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to grade this submission' });
    }

    // Update answer grades from grades object (questionId -> points)
    if (grades && typeof grades === 'object') {
      Object.entries(grades).forEach(([questionId, points]) => {
        const answer = submission.answers.find(a => a.questionId.toString() === questionId.toString());
        if (answer) {
          answer.pointsEarned = points;
          answer.feedback = feedback?.[questionId] || '';
          answer.gradedAt = new Date();
          answer.gradedBy = req.user._id;
        }
      });
    }

    // Calculate total points earned
    const totalEarned = submission.answers.reduce((sum, ans) => sum + (ans.pointsEarned || 0), 0);
    submission.totalPointsEarned = totalEarned || totalPointsEarned || 0;
    submission.scorePercentage = (submission.totalPointsEarned / submission.maxPoints) * 100;
    submission.status = 'graded';
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error('Grade assignment error:', err);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
};

// Get student submission
exports.getStudentSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    const submission = await AssignmentSubmission.findOne({
      assignment: assignmentId,
      student: req.user._id
    }).populate('assignment gradedBy', 'name email');

    if (!submission) {
      return res.status(404).json({ error: 'No submission found' });
    }

    res.json(submission);
  } catch (err) {
    console.error('Get student submission error:', err);
    res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

// Get all submissions for assignment (instructor)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Verify instructor
    if (assignment.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const submissions = await AssignmentSubmission.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// Get course assignment statistics
exports.getAssignmentStats = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Verify instructor
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const assignments = await Assignment.find({ course: courseId });
    
    const stats = await Promise.all(
      assignments.map(async (assignment) => {
        const submissions = await AssignmentSubmission.find({ assignment: assignment._id });
        const graded = submissions.filter(s => s.status === 'graded');
        const avgScore = graded.length > 0 
          ? graded.reduce((sum, s) => sum + s.scorePercentage, 0) / graded.length 
          : 0;

        return {
          assignmentId: assignment._id,
          title: assignment.title,
          totalStudents: course.enrolledStudents.length,
          submissions: submissions.length,
          graded: graded.length,
          pending: submissions.filter(s => s.status === 'submitted').length,
          averageScore: avgScore.toFixed(2),
          passingRate: graded.length > 0 
            ? ((graded.filter(s => s.scorePercentage >= assignment.passingScore).length / graded.length) * 100).toFixed(2)
            : 0
        };
      })
    );

    res.json(stats);
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};
