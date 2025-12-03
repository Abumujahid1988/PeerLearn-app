const Newsletter = require('../models/Newsletter');
const sgMail = require('@sendgrid/mail');

// Prefer explicit SENDGRID_API_KEY, but allow using SMTP_PASS if it contains a SendGrid key (starts with 'SG.')
let sendGridApiKey = process.env.SENDGRID_API_KEY || null;
if (!sendGridApiKey && process.env.SMTP_PASS && String(process.env.SMTP_PASS).startsWith('SG.')) {
  sendGridApiKey = process.env.SMTP_PASS;
}

const isSendGridEnabled = !!sendGridApiKey;
if (isSendGridEnabled) {
  try {
    sgMail.setApiKey(sendGridApiKey);
    console.info('SendGrid is enabled for outgoing newsletter emails.');
  } catch (e) {
    console.error('Failed to initialize SendGrid mail client. Emails will be skipped.', e);
  }
} else {
  console.warn('SendGrid not configured — newsletter emails will be skipped. Set SENDGRID_API_KEY in environment to enable.');
}

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
      from: process.env.SENDGRID_FROM_EMAIL || process.env.SMTP_FROM || 'abumujahid555@gmail.com',
      subject: 'PeerLearn Newsletter Subscription',
      text: `Hello${name ? ' ' + name : ''},\n\nThank you for subscribing to PeerLearn updates!`,
      html: `<p>Hello${name ? ' ' + name : ''},</p><p>Thank you for subscribing to <b>PeerLearn</b> updates!</p>`
    };
    if (isSendGridEnabled) {
      try {
        await sgMail.send(msg);
      } catch (emailErr) {
        console.error('SendGrid email error:', emailErr);
      }
    } else {
      console.info('SendGrid not configured; skipping subscription confirmation email.');
    }

    return res.json({ message: 'Subscribed', subscriber: { email: doc.email, name: doc.name } });
  } catch (err) {
    console.error('Newsletter subscribe error', err);
    return res.status(500).json({ error: 'Failed to subscribe' });
  }
};
