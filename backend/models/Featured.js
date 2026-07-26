const mongoose = require('mongoose');

const featuredSchema = new mongoose.Schema({
  itemType: { type: String, enum: ["House", "Car"], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "itemType" },
}, { timestamps: true });

module.exports = mongoose.model('Featured', featuredSchema);
