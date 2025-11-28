const Newsletter = require('../models/Newsletter');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

    // Send confirmation email via SendGrid
    const msg = {
      to: doc.email,
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@peerlearn.app',
      subject: 'PeerLearn Newsletter Subscription',
      text: `Hello${name ? ' ' + name : ''},\n\nThank you for subscribing to PeerLearn updates!`,
      html: `<p>Hello${name ? ' ' + name : ''},</p><p>Thank you for subscribing to <b>PeerLearn</b> updates!</p>`
    };
    try {
      await sgMail.send(msg);
    } catch (emailErr) {
      console.error('SendGrid email error:', emailErr);
    }

    return res.json({ message: 'Subscribed', subscriber: { email: doc.email, name: doc.name } });
  } catch (err) {
    console.error('Newsletter subscribe error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
};
