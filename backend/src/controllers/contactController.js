const ContactMessage = require('../models/ContactMessage');
const sendEmail = require('../utils/sendEmail');

exports.submit = async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!email || !message) return res.status(400).json({ error: 'Email and message are required' });

    const doc = await ContactMessage.create({
      name: name || '',
      email,
      message,
      ip: req.ip,
      userAgent: req.get('User-Agent') || ''
    });

    // Send notification email to support if sendEmail is configured
    try {
      const supportTo = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
      if (supportTo) {
        const subject = `New contact message from ${email}`;
        const html = `<p><strong>Name:</strong> ${name || 'N/A'}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>`;
        await sendEmail({ to: supportTo, subject, html });
      }
    } catch (mailErr) {
      console.warn('Failed to send contact notification email', mailErr?.message || mailErr);
    }

    // Optionally send a confirmation email back to the user
    try {
      // By default send confirmation unless explicitly disabled
      const sendConfirmation = process.env.SEND_CONTACT_CONFIRMATION !== 'false';
      const fromAddress = process.env.SUPPORT_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
      if (sendConfirmation && fromAddress) {
        const userSubject = 'We received your message — PeerLearn';
        const userHtml = `
          <p>Hi ${name || ''},</p>
          <p>Thanks for reaching out to PeerLearn. We've received your message and our support team will get back to you as soon as possible.</p>
          <hr/>
          <p><strong>Your message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
          <p style="color:gray;font-size:12px">If you didn't submit this message or need to follow up, reply to this email.</p>
        `;
        await sendEmail({ to: email, subject: userSubject, html: userHtml, from: fromAddress });
      }
    } catch (confirmErr) {
      console.warn('Failed to send confirmation email to user', confirmErr?.message || confirmErr);
    }

    return res.json({ message: 'Message received', id: doc._id });
  } catch (err) {
    console.error('Contact submit error', err);
    return res.status(500).json({ error: 'Failed to submit message' });
  }
};
