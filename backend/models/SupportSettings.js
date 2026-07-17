const mongoose = require('mongoose');

const supportSettingsSchema = new mongoose.Schema({
  supportEmail: { type: String, default: '' },
  supportPhone: { type: String, default: '' },
  supportHours: { type: String, default: '' },
  whatsappNumber: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SupportSettings', supportSettingsSchema);
