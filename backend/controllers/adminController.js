const ContactMessage = require('../models/ContactMessage');
const Faq = require('../models/Faq');
const Review = require('../models/Review');
const User = require('../models/User');
const House = require('../models/House');
const Car = require('../models/Car');
const Booking = require('../models/Booking');

async function getDashboardStats(req, res) {
  try {
    const [totalUsers, totalHouses, totalCars, pendingBookings, pendingHouses, pendingCars] = await Promise.all([
      User.countDocuments(),
      House.countDocuments(),
      Car.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      House.countDocuments({ status: 'pending' }),
      Car.countDocuments({ status: 'pending' })
    ]);

    res.json({
      totalUsers,
      totalListings: totalHouses + totalCars,
      pendingBookings,
      pendingListings: pendingHouses + pendingCars
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getAllHousesAdmin(req, res) {
  try {
    const houses = await House.find();
    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function approveHouse(req, res) {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function rejectHouse(req, res) {
  try {
    const house = await House.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getAllCarsAdmin(req, res) {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function approveCar(req, res) {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function rejectCar(req, res) {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_housescars
async function getAllBookingsAdmin(req, res) {
  try {
    const bookings = await Booking.find().populate('userId', 'name email');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function confirmBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function cancelBooking(req, res) {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_bookings
async function getAllUsersAdmin(req, res) {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function blockUser(req, res) {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot block your own account' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function unblockUser(req, res) {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_users
async function getAllReviewsAdmin(req, res) {
  try {
    const reviews = await Review.find().populate('userId', 'name email');
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function approveReview(req, res) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteReview(req, res) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_reviews
async function createFaqAdmin(req, res) {
  try {
    const { question, answer, order } = req.body;
    const faq = await Faq.create({ question, answer, order });
    res.status(201).json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function updateFaqAdmin(req, res) {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteFaqAdmin(req, res) {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json({ message: 'FAQ deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getAllContactMessagesAdmin(req, res) {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteContactMessageAdmin(req, res) {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Contact message deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_part8
module.exports = {
  getDashboardStats,
  getAllHousesAdmin,
  approveHouse,
  rejectHouse,
  getAllCarsAdmin,
  approveCar,
  rejectCar,
  getAllBookingsAdmin,
  confirmBooking,
  cancelBooking,
  getAllUsersAdmin,
  blockUser,
  unblockUser,
  deleteUser,
  getAllReviewsAdmin,
  approveReview,
  deleteReview,
  createFaqAdmin,
  updateFaqAdmin,
  deleteFaqAdmin,
  getAllContactMessagesAdmin,
  deleteContactMessageAdmin
};
