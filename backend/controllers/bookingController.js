const Booking = require('../models/Booking');
const House = require('../models/House');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { buildCustomerBookingEmail, buildAdminBookingEmail } = require('../utils/emailTemplates');

async function create(req, res) {
  try {
    const { listingId, listingType, startDate, endDate } = req.body;

    // ADMIN_MARKER_bookingverify
    const customerUser = await User.findById(req.user.userId);
    if (!customerUser) {
      return res.status(401).json({ message: 'Please log in again.' });
    }
    if (!customerUser.verified) {
      return res.status(403).json({ message: 'Please verify your email before booking.' });
    }

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

    // ADMIN_MARKER_bookingemails
    const unit = listingType === 'house' ? 'night' : 'day';
    const formattedStart = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedEnd = end.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (customerUser) {
      await sendEmail(
        customerUser.email,
        `Booking Confirmed - ${listing.title}`,
        buildCustomerBookingEmail({
          customerName: customerUser.name,
          listingTitle: listing.title,
          listingLocation: listing.location,
          listingType,
          startDate: formattedStart,
          endDate: formattedEnd,
          days,
          unit,
          totalPrice,
          adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL
        })
      );
    }

    await sendEmail(
      process.env.ADMIN_NOTIFICATION_EMAIL,
      `New Booking Received - ${listing.title}`,
      buildAdminBookingEmail({
        customerName: customerUser ? customerUser.name : 'Unknown',
        customerEmail: customerUser ? customerUser.email : 'Unknown',
        listingTitle: listing.title,
        listingLocation: listing.location,
        listingType,
        startDate: formattedStart,
        endDate: formattedEnd,
        days,
        totalPrice
      })
    );

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