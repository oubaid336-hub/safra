const Faq = require('../models/Faq');

async function getAllFaqs(req, res) {
  try {
    const faqs = await Faq.find().sort({ order: 1 });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { getAllFaqs };
