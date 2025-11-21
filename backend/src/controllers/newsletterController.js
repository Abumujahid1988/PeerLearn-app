const Newsletter = require('../models/Newsletter');

exports.subscribe = async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }

    const existing = await Newsletter.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.json({ message: 'Already subscribed' });
    }

    const doc = new Newsletter({ email: email.toLowerCase().trim(), name });
    await doc.save();
    return res.json({ message: 'Subscribed', subscriber: { email: doc.email, name: doc.name } });
  } catch (err) {
    console.error('Newsletter subscribe error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
};
