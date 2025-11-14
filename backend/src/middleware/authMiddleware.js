const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    const auth = req.headers.authorization || req.cookies?.token;
    if(!auth) return res.status(401).json({ error: 'No token' });
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : auth;
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if(!user) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  } catch(err) {
    console.error(err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
