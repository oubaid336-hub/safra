const Review = require('../models/Review');

async function createReview(req, res) {
  try {
    const { listingId, listingType, rating, comment } = req.body;

    const review = await Review.create({
      userId: req.user.userId,
      listingId,
      listingType,
      rating,
      comment,
      approved: true
    });

    res.status(201).json({ message: 'Review submitted', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getReviewsForListing(req, res) {
  try {
    const { listingType, listingId } = req.params;
    const reviews = await Review.find({ listingType, listingId, approved: true })
      .populate('userId', 'name');
    res.json(reviews);
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
      { $match: { listingType, approved: true } },
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
