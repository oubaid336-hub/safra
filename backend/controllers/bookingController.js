const Booking = require('../models/Booking');
const House = require('../models/House');
const Car = require('../models/Car');

async function create(req, res) {
  try {
    const { listingId, listingType, startDate, endDate } = req.body;

    let listing;
    if (listingType === 'house') {
      listing = await House.findById(listingId);
    } else if (listingType === 'car') {
      listing = await Car.findById(listingId);
    } else {
      return res.status(400).json({ message: 'Invalid listing type' });
    }

    if (!listing || listing.status !== 'approved') {
      return res.status(404).json({ message: 'Listing not available' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24);

    if (!(days > 0)) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    const pricePerUnit = listingType === 'house' ? listing.pricePerNight : listing.pricePerDay;
    const totalPrice = days * pricePerUnit;

    const booking = await Booking.create({
      userId: req.user.userId,
      listingId,
      listingType,
      startDate: start,
      endDate: end,
      totalPrice
    });

    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getMine(req, res) {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { create, getMine };
