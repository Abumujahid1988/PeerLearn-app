const Thread = require('../models/Discussion');
const Course = require('../models/Course');

exports.listByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const threads = await Thread.find({ course: courseId }).populate('author','name').sort({ pinned: -1, createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const course = await Course.findById(courseId);
    if(!course) return res.status(404).json({ error: 'Course not found' });
    const thread = await Thread.create({ course: courseId, author: req.user._id, title, content });
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.getThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id).populate('author','name').populate('comments.author','name');
    if(!thread) return res.status(404).json({ error: 'Not found' });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const comment = { author: req.user._id, content };
    thread.comments.push(comment);
    await thread.save();
    // Get the last comment (just added)
    const populatedThread = await Thread.findById(thread._id).populate('comments.author', 'name');
    const newComment = populatedThread.comments[populatedThread.comments.length - 1];
    res.status(201).json(newComment);

    // Emit real-time update to course room
    if (req.app.get('io')) {
      req.app.get('io').to(`course-${thread.course}`).emit('newComment', {
        threadId: thread._id.toString(),
        comment: newComment
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if(!thread) return res.status(404).json({ error: 'Not found' });
    if(String(thread.author) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await thread.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if(!thread) return res.status(404).json({ error: 'Not found' });
    const comment = thread.comments.id(req.params.commentId);
    if(!comment) return res.status(404).json({ error: 'Comment not found' });
    if(String(comment.author) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    comment.remove();
    await thread.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
