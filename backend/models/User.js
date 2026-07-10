const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  verified: { type: Boolean, default: false },
  subscribeToNotifications: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
