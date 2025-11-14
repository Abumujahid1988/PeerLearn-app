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
  if(!progress.completedLessons.includes(lessonId)) progress.completedLessons.push(lessonId);
  const course = await Course.findById(req.params.courseId).populate('lessons');
  progress.percentage = Math.round((progress.completedLessons.length / (course.lessons.length || 1)) * 100);
  await progress.save();
  res.json(progress);
};
