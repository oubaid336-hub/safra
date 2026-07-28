const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  listingId: { type: mongoose.Schema.Types.ObjectId },
  listingType: { type: String, enum: ['house', 'car'] },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  approved: { type: Boolean, default: true },
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

reviewSchema.index({ bookingId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
