const Section = require('../models/Section');
const Course = require('../models/Course');

exports.create = async (req, res) => {
  const { courseId, title, description, order } = req.body;
  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ error: 'Course not found' });
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const section = await Section.create({ course: courseId, title, description, order });
  course.sections.push(section._id);
  await course.save();
  res.status(201).json(section);
};

exports.update = async (req, res) => {
  const section = await Section.findById(req.params.id);
  if(!section) return res.status(404).json({ error: 'Not found' });
  const course = await Course.findById(section.course);
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { title, description, order } = req.body;
  if(title) section.title = title;
  if(description) section.description = description;
  if(typeof order !== 'undefined') section.order = order;
  await section.save();
  res.json(section);
};

exports.remove = async (req, res) => {
  const section = await Section.findById(req.params.id);
  if(!section) return res.status(404).json({ error: 'Not found' });
  const course = await Course.findById(section.course);
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  // remove section and associated lessons handled by course controller when removing course; here just remove section ref from course
  course.sections = course.sections.filter(s => String(s) !== String(section._id));
  await course.save();
  await section.remove();
  res.json({ success: true });
};

exports.reorder = async (req, res) => {
  // Accepts array of section ids in new order
  const { courseId, orderedSectionIds } = req.body;
  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ error: 'Course not found' });
  if(String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  if(!Array.isArray(orderedSectionIds)) return res.status(400).json({ error: 'orderedSectionIds must be an array' });
  // update order field for each section
  for(let i=0;i<orderedSectionIds.length;i++){
    await Section.findByIdAndUpdate(orderedSectionIds[i], { order: i });
  }
  res.json({ success: true });
};
