const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isBlocked: { type: Boolean, default: false }, // ADMIN_MARKER_isblocked
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date }, // ADMIN_MARKER_verifyfields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }, // ADMIN_MARKER_resetfields // ADMIN_MARKER_role
  verified: { type: Boolean, default: false },
  subscribeToNotifications: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
