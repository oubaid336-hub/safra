const express = require('express');
const router = express.Router();
const Featured = require('../models/Featured');
const House = require('../models/House');
const Car = require('../models/Car');

// Admin: candidates to pick from
router.get('/candidates', async (req, res) => {
  try {
    const houses = await House.find({}, 'title location pricePerNight').lean();
    const cars = await Car.find({}, 'title location pricePerDay').lean();
    res.json({ houses, cars });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: get the current featured picks for the homepage
router.get('/', async (req, res) => {
  try {
    const entries = await Featured.find().lean();
    const houseIds = entries.filter(e => e.itemType === 'House').map(e => e.refId);
    const carIds = entries.filter(e => e.itemType === 'Car').map(e => e.refId);

    const houses = await House.find({ _id: { $in: houseIds } }).limit(2);
    const cars = await Car.find({ _id: { $in: carIds } }).limit(1);

    res.json({ houses, car: cars[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: set the featured picks (replaces current selection)
// body: { houseIds: [id1, id2, ...], carId: id }
router.post('/', async (req, res) => {
  try {
    const { houseIds = [], carId } = req.body;
    await Featured.deleteMany({});

    const docs = [];
    houseIds.slice(0, 2).forEach(id => docs.push({ itemType: 'House', refId: id }));
    if (carId) docs.push({ itemType: 'Car', refId: carId });

    await Featured.insertMany(docs);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
