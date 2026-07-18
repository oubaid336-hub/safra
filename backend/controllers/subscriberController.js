const crypto = require('crypto');
const Subscriber = require('../models/Subscriber');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function subscribe(req, res) {
  try {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }
    const normalized = email.toLowerCase();
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) {
      return res.json({ message: 'Already subscribed' });
    }
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');
    await Subscriber.create({ email: normalized, unsubscribeToken });
    res.status(201).json({ message: 'Subscribed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function unsubscribe(req, res) {
  try {
    const { token } = req.params;
    const result = await Subscriber.findOneAndDelete({ unsubscribeToken: token });
    if (!result) {
      return res.status(400).send('Invalid or already-used unsubscribe link.');
    }
    res.send('You have been unsubscribed.');
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong.');
  }
}

module.exports = { subscribe, unsubscribe };
