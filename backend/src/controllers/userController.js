const User = require('../models/User');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if(!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const user = req.user;
  const { name, bio, avatarUrl } = req.body;
  if(name) user.name = name;
  if(bio) user.bio = bio;
  if(avatarUrl) user.avatarUrl = avatarUrl;
  await user.save();
  res.json({ user });
};
