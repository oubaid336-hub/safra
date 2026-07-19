const ContactMessage = require('../models/ContactMessage');
const SupportSettings = require('../models/SupportSettings');
const { sendEmail } = require('../utils/mailer');
const { buildContactNotificationEmail } = require('../utils/emailTemplates');

async function submitContactMessage(req, res) {
  try {
    const { name, email, message } = req.body;
    const contactMessage = await ContactMessage.create({ name, email, message });

    const settings = await SupportSettings.findOne();
    const notifyEmail = (settings && settings.supportEmail) || process.env.ADMIN_EMAIL;

    if (notifyEmail) {
      await sendEmail(
        notifyEmail,
        'New contact message on Safra',
        buildContactNotificationEmail({ name, email, message })
      );
    }

    res.status(201).json({ message: 'Message received', id: contactMessage._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { submitContactMessage };
