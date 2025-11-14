const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

exports.create = async (req, res) => {
  const { courseId, title, content, order, duration } = req.body;
  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ error: 'Course not found' });
  if(String(course.instructor) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const lesson = await Lesson.create({ course: courseId, title, content, order, duration });
  course.lessons.push(lesson._id);
  await course.save();
  res.status(201).json(lesson);
};

exports.update = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if(!lesson) return res.status(404).json({ error: 'Not found' });
  const course = await Course.findById(lesson.course);
  if(String(course.instructor) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, content, order, duration } = req.body;
  if(title) lesson.title = title;
  if(content) lesson.content = content;
  if(order) lesson.order = order;
  if(duration) lesson.duration = duration;
  await lesson.save();
  res.json(lesson);
};

exports.remove = async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if(!lesson) return res.status(404).json({ error: 'Not found' });
  const course = await Course.findById(lesson.course);
  if(String(course.instructor) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await lesson.remove();
  res.json({ success: true });
};
