const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

exports.list = async (req, res) => {
  const courses = await Course.find().populate('instructor','name email');
  res.json(courses);
};

exports.create = async (req, res) => {
  const { title, description, category, difficulty, tags, price, thumbnail } = req.body;
  const course = await Course.create({ title, description, category, difficulty, tags, price, thumbnail, instructor: req.user._id });
  res.status(201).json(course);
};

exports.get = async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email')
    .populate({
      path: 'sections',
      populate: { path: 'lessons', model: 'Lesson' }
    });
  if(!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
};

exports.update = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({ error: 'Not found' });
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, category, difficulty, tags, price, thumbnail, isPublished } = req.body;
  if(title) course.title = title;
  if(description) course.description = description;
  if(category) course.category = category;
  if(difficulty) course.difficulty = difficulty;
  if(tags) course.tags = tags;
  if(typeof price !== 'undefined') course.price = price;
  if(thumbnail) course.thumbnail = thumbnail;
  if(typeof isPublished === 'boolean') course.isPublished = isPublished;
  await course.save();
  res.json(course);
};

exports.remove = async (req, res) => {
  const course = await Course.findById(req.params.id);
  if(!course) return res.status(404).json({ error: 'Not found' });
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  // remove sections and lessons cascade
  const sections = await Section.find({ course: course._id });
  for(const s of sections) {
    await Lesson.deleteMany({ section: s._id });
    await s.remove();
  }
  await Enrollment.deleteMany({ course: course._id });
  await course.remove();
  res.json({ success: true });
};

exports.enroll = async (req, res) => {
  const course = await Course.findById(req.params.id);
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
  res.json({ enrollment, course });
};
