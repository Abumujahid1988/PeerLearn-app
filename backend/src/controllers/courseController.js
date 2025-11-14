const Course = require('../models/Course');
const Lesson = require('../models/Lesson');

exports.list = async (req, res) => {
  const courses = await Course.find().populate('instructor','name email');
  res.json(courses);
};

exports.create = async (req, res) => {
  const { title, description, category } = req.body;
  const course = await Course.create({ title, description, category, instructor: req.user.id });
  res.status(201).json(course);
};

exports.get = async (req, res) => {
  const course = await Course.findById(req.params.id).populate('lessons').populate('instructor','name');
  if(!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
};

exports.update = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({ error: 'Not found' });
  if(String(course.instructor) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, category, published } = req.body;
  if(title) course.title = title;
  if(description) course.description = description;
  if(category) course.category = category;
  if(typeof published === 'boolean') course.published = published;
  await course.save();
  res.json(course);
};

exports.remove = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({ error: 'Not found' });
  if(String(course.instructor) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await course.remove();
  res.json({ success: true });
};

exports.enroll = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({ error: 'Not found' });
  if(!course.students.includes(req.user.id)) course.students.push(req.user.id);
  await course.save();
  res.json(course);
};
