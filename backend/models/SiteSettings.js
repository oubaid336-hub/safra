const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Safra' },
  logoText: { type: String, default: 'S' },
  currency: { type: String, enum: ['USD', 'EUR', 'TND'], default: 'TND' },
  maintenanceMode: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
