const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  location: String,
  pricePerDay: Number,
  photos: [{ type: String }],
  seats: Number,
  transmission: { type: String, enum: ['automatic', 'manual'] },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
  year: Number,
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Car', carSchema);




