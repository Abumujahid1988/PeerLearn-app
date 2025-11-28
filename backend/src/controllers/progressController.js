const Progress = require('../models/Progress');
const Course = require('../models/Course');

exports.get = async (req, res) => {
  const progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId }).populate('completedLessons');
  res.json(progress || { percentage: 0, completedLessons: [] });
};

exports.update = async (req, res) => {
  const { lessonId } = req.body;
  let progress = await Progress.findOne({ user: req.user.id, course: req.params.courseId });
  if(!progress) progress = await Progress.create({ user: req.user.id, course: req.params.courseId, completedLessons: [], percentage: 0 });
  const lidStr = String(lessonId);
  const existing = (progress.completedLessons || []).map(x => String(x));
  if (!existing.includes(lidStr)) progress.completedLessons.push(lessonId);
  // Aggregate all lessons from all sections
  const course = await Course.findById(req.params.courseId).populate({
    path: 'sections',
    populate: { path: 'lessons', model: 'Lesson' }
  });
  let allLessons = [];
  if (course && Array.isArray(course.sections)) {
    course.sections.forEach(section => {
      if (section.lessons && Array.isArray(section.lessons)) {
        allLessons = allLessons.concat(section.lessons.map(l => l._id ? l._id.toString() : l.toString()));
      }
    });
  }
  // Remove duplicates just in case
  allLessons = [...new Set(allLessons)];
  progress.percentage = Math.round((progress.completedLessons.length / (allLessons.length || 1)) * 100);
  await progress.save();
  res.json(progress);
};
