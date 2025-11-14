const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if(!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
    const exists = await User.findOne({ email });
    if(exists) return res.status(400).json({ error: 'User exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(404).json({ error: 'User not found' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch(err) { res.status(500).json({ error: err.message }); }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
