const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Section = require('../models/Section');

exports.create = async (req, res) => {
  try {
    const { courseId, sectionId, title, description, content, order, duration, videoUrl, attachments } = req.body;
    if (!courseId || !sectionId || !title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (typeof order !== 'undefined' && isNaN(Number(order))) {
      return res.status(400).json({ error: 'Order must be a number' });
    }
    if (typeof duration !== 'undefined' && isNaN(Number(duration))) {
      return res.status(400).json({ error: 'Duration must be a number' });
    }
    const course = await Course.findById(courseId);
    if(!course) return res.status(404).json({ error: 'Course not found' });
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const section = await Section.findById(sectionId);
    if(!section) return res.status(404).json({ error: 'Section not found' });
    const lesson = await Lesson.create({ course: courseId, section: sectionId, title, description, content, order, duration, videoUrl, attachments });
    section.lessons.push(lesson._id);
    await section.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if(!lesson) return res.status(404).json({ error: 'Not found' });
    const course = await Course.findById(lesson.course);
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const { title, description, content, order, duration, videoUrl, attachments } = req.body;
    if(title) lesson.title = title;
    if(description) lesson.description = description;
    if(content) lesson.content = content;
    if(typeof order !== 'undefined') {
      if (isNaN(Number(order))) return res.status(400).json({ error: 'Order must be a number' });
      lesson.order = order;
    }
    if(typeof duration !== 'undefined') {
      if (isNaN(Number(duration))) return res.status(400).json({ error: 'Duration must be a number' });
      lesson.duration = duration;
    }
    if(videoUrl) lesson.videoUrl = videoUrl;
    if(attachments) lesson.attachments = attachments;
    await lesson.save();
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if(!lesson) return res.status(404).json({ error: 'Not found' });
    const course = await Course.findById(lesson.course);
    if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    // remove from section
    const section = await Section.findById(lesson.section);
    if(section) {
      section.lessons = section.lessons.filter(l => String(l) !== String(lesson._id));
      await section.save();
    }
    await lesson.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
