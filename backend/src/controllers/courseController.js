const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

exports.list = async (req, res) => {
  try {
    let courses = await Course.find().populate('instructor','name email').populate('enrolledStudents', '_id');
    courses = courses.map(course => {
      const obj = course.toObject();
      obj.enrolledStudents = (obj.enrolledStudents || []).map(u => String(u._id));
      return obj;
    });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, category, difficulty, tags, price, thumbnail } = req.body;
    if (!title || !description || !category || !difficulty) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (typeof price !== 'undefined' && isNaN(Number(price))) {
      return res.status(400).json({ error: 'Price must be a number' });
    }
    const course = await Course.create({ title, description, category, difficulty, tags, price, thumbnail, instructor: req.user._id });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate({
        path: 'sections',
        populate: { path: 'lessons', model: 'Lesson' }
      });
    if(!course) return res.status(404).json({ error: 'Not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ error: 'Not found' });
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { title, description, category, difficulty, tags, price, thumbnail, isPublished } = req.body;
    if(title) course.title = title;
    if(description) course.description = description;
    if(category) course.category = category;
    if(difficulty) course.difficulty = difficulty;
    if(tags) course.tags = tags;
    if(typeof price !== 'undefined') {
      if (isNaN(Number(price))) return res.status(400).json({ error: 'Price must be a number' });
      course.price = price;
    }
    if(thumbnail) course.thumbnail = thumbnail;
    if(typeof isPublished === 'boolean') course.isPublished = isPublished;
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ error: 'Not found' });
    if(req.user.role !== 'admin' && String(course.instructor) !== String(req.user._id)) return res.status(403).json({ error: 'Forbidden' });
    // remove sections and lessons cascade
    const sections = await Section.find({ course: course._id });
    for(const s of sections) {
      await Lesson.deleteMany({ section: s._id });
      await s.remove();
    }
    await Enrollment.deleteMany({ course: course._id });
    await course.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.enroll = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);
    if(!course) return res.status(404).json({ error: 'Not found' });
    // create or update enrollment
    let enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
    if(!enrollment) {
      enrollment = await Enrollment.create({ student: req.user._id, course: course._id });
      // add to enrolledStudents array if not present
      if(!course.enrolledStudents.includes(req.user._id)) {
        course.enrolledStudents.push(req.user._id);
        await course.save();
      }
    }
    // Always return course with populated enrolledStudents for frontend
    course = await Course.findById(course._id).populate('enrolledStudents', '_id');
    let courseObj = course.toObject();
    courseObj.enrolledStudents = (courseObj.enrolledStudents || []).map(u => String(u._id));
    res.json({ enrollment, course: courseObj });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Reorder sections within a course
exports.reorderSections = async (req, res) => {
  try {
    const { id } = req.params; // course id
    const { sectionIds } = req.body;
    if (!Array.isArray(sectionIds)) return res.status(400).json({ error: 'sectionIds array required' });
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    // Ensure all provided ids exist and belong to this course
    const sections = await Section.find({ _id: { $in: sectionIds }, course: course._id });
    if (sections.length !== sectionIds.length) return res.status(400).json({ error: 'Invalid section ids' });
    course.sections = sectionIds;
    await course.save();
    res.json({ success: true, sections: course.sections });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Reorder lessons within a section
exports.reorderLessonsInSection = async (req, res) => {
  try {
    const { id } = req.params; // section id
    const { lessonIds } = req.body;
    if (!Array.isArray(lessonIds)) return res.status(400).json({ error: 'lessonIds array required' });
    const section = await Section.findById(id);
    if (!section) return res.status(404).json({ error: 'Section not found' });
    const course = await Course.findById(section.course);
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const lessons = await Lesson.find({ _id: { $in: lessonIds }, section: section._id });
    if (lessons.length !== lessonIds.length) return res.status(400).json({ error: 'Invalid lesson ids' });
    section.lessons = lessonIds;
    await section.save();
    res.json({ success: true, lessons: section.lessons });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
