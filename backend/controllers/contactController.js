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

async function getContactMessages(req, res) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function markMessageHandled(req, res) {
  try {
    const { handled } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { handled: handled === true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { submitContactMessage, getContactMessages, markMessageHandled };
