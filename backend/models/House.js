const mongoose = require('mongoose');

const houseSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  location: String,
  pricePerNight: Number,
  photos: [{ type: String }],
  rooms: Number,
  bathrooms: Number,
  capacity: Number,
  amenities: [{ type: String }],
  bookedRanges: [{ start: Date, end: Date }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('House', houseSchema);
