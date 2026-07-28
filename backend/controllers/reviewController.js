const Review = require('../models/Review');
const Booking = require('../models/Booking');

async function createReview(req, res) {
  try {
    const { listingId, listingType, rating, comment } = req.body;

    const eligibleBookings = await Booking.find({
      userId: req.user.userId,
      listingId,
      listingType,
      status: { $in: ['confirmed', 'pending-cash-payment'] }
    }).select('_id');

    if (!eligibleBookings.length) {
      return res.status(403).json({ message: 'You can only review a listing you have booked' });
    }

    const bookingIds = eligibleBookings.map(b => b._id);
    const reviewed = await Review.find({ bookingId: { $in: bookingIds } }).select('bookingId');
    const reviewedIds = reviewed.map(r => String(r.bookingId));

    const availableBooking = eligibleBookings.find(b => !reviewedIds.includes(String(b._id)));

    if (!availableBooking) {
      return res.status(409).json({ message: 'You have already reviewed this stay' });
    }

    const review = await Review.create({
      userId: req.user.userId,
      listingId,
      listingType,
      bookingId: availableBooking._id,
      rating,
      comment,
      approved: true
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already reviewed this stay' });
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getReviewsForListing(req, res) {
  try {
    const { listingType, listingId } = req.params;
    const reviews = await Review.find({ listingType, listingId, approved: true })
      .populate('userId', 'name');

    const requesterId = req.user?.userId;
    const isAdmin = req.user?.role === 'admin';

    const visible = reviews.filter(r => {
      if (!r.hidden) return true;
      if (isAdmin) return true;
      if (requesterId && r.userId && String(r.userId._id) === String(requesterId)) return true;
      return false;
    });

    res.json(visible);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getRatingSummary(req, res) {
  try {
    const { listingType } = req.params;
    if (!['house', 'car'].includes(listingType)) {
      return res.status(400).json({ message: 'Invalid listing type' });
    }

    const results = await Review.aggregate([
      { $match: { listingType, approved: true, hidden: { $ne: true } } },
      { $group: { _id: '$listingId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const summary = results.map(r => ({
      listingId: String(r._id),
      avgRating: Math.round(r.avgRating * 10) / 10,
      count: r.count
    }));

    res.json(summary);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { createReview, getReviewsForListing, getRatingSummary };
