const ContactMessage = require('../models/ContactMessage');

async function submitContactMessage(req, res) {
  try {
    const { name, email, message } = req.body;
    const contactMessage = await ContactMessage.create({ name, email, message });
    res.status(201).json({ message: 'Message received', id: contactMessage._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { submitContactMessage };
