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
      approved: false
    });

    res.status(201).json({ message: 'Review submitted, pending approval', review });
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

module.exports = { createReview, getReviewsForListing };
