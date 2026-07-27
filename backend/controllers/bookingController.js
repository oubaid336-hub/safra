const Booking = require('../models/Booking');
const House = require('../models/House');
const Car = require('../models/Car');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { buildCustomerBookingEmail, buildAdminBookingEmail } = require('../utils/emailTemplates');

async function create(req, res) {
  try {
    const { listingId, listingType, startDate, endDate } = req.body;

    const customerUser = await User.findById(req.user.userId);
    if (!customerUser) {
      return res.status(401).json({ message: 'Please log in again.' });
    }
    if (customerUser.isBlocked) {
      return res.status(403).json({ message: 'This account has been blocked.' });
    }
    if (!customerUser.verified) {
      return res.status(403).json({ message: 'Please verify your emailbefore booking.' });
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

    const overlapping = await Booking.findOne({
      listingId,
      listingType,
      status: { $in: ['pending', 'confirmed', 'pending-cash-payment'] },
      startDate: { $lt: end },
      endDate: { $gt: start }
    });

    if (overlapping) {
      return res.status(409).json({ message: 'This listing is already booked for part of that date range.' });
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

    const unit = listingType === 'house' ? 'night' : 'day';
    const formattedStart = start.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedEnd = end.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    if (customerUser) {
      await sendEmail(
        customerUser.email,
        `Booking Request Received - ${listing.title}`,
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

async function getAvailability(req, res) {
  try {
    const { listingId, listingType } = req.query;

    if (!listingId || !['house', 'car'].includes(listingType)) {
      return res.status(400).json({ message: 'Invalid listing' });
    }

    const bookings = await Booking.find({
      listingId,
      listingType,
      status: { $in: ['pending', 'confirmed', 'pending-cash-payment'] }
    }).select('startDate endDate -_id');

    res.json(bookings);
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

async function confirmCash(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'pending') {
      return res.status(409).json({ message: 'Booking already processed' });
    }
    booking.status = 'pending-cash-payment';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getOne(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function cancel(req, res) {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') {
      return res.status(409).json({ message: 'Booking already cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { create, getAvailability, getMine, confirmCash, cancel, getOne };
