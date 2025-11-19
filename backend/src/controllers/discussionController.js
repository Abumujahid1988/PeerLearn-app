const Thread = require('../models/Discussion');
const Course = require('../models/Course');

exports.listByCourse = async (req, res) => {
  const courseId = req.params.courseId;
  const threads = await Thread.find({ course: courseId }).populate('author','name').sort({ pinned: -1, createdAt: -1 });
  res.json(threads);
};

exports.createThread = async (req, res) => {
  const { courseId } = req.params;
  const { title, content } = req.body;
  const course = await Course.findById(courseId);
  if(!course) return res.status(404).json({ error: 'Course not found' });
  const thread = await Thread.create({ course: courseId, author: req.user._id, title, content });
  res.status(201).json(thread);
};

exports.getThread = async (req, res) => {
  const thread = await Thread.findById(req.params.id).populate('author','name').populate('comments.author','name');
  if(!thread) return res.status(404).json({ error: 'Not found' });
  res.json(thread);
};

exports.addComment = async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if(!thread) return res.status(404).json({ error: 'Not found' });
  const { content } = req.body;
  const comment = { author: req.user._id, content };
  thread.comments.push(comment);
  await thread.save();
  const populated = await Thread.findById(thread._id).populate('comments.author','name');
  res.status(201).json(populated);
};

exports.deleteThread = async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if(!thread) return res.status(404).json({ error: 'Not found' });
  if(String(thread.author) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await thread.remove();
  res.json({ success: true });
};

exports.deleteComment = async (req, res) => {
  const thread = await Thread.findById(req.params.id);
  if(!thread) return res.status(404).json({ error: 'Not found' });
  const comment = thread.comments.id(req.params.commentId);
  if(!comment) return res.status(404).json({ error: 'Comment not found' });
  if(String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  comment.remove();
  await thread.save();
  res.json({ success: true });
};
