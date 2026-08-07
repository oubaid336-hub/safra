const ContactMessage = require('../models/ContactMessage');
const Faq = require('../models/Faq');
const Review = require('../models/Review');
const User = require('../models/User');
const House = require('../models/House');
const Car = require('../models/Car');
const Subscriber = require('../models/Subscriber');
const { sendEmail } = require('../utils/mailer');
const { buildListingBroadcastEmail } = require('../utils/emailTemplates');
const Booking = require('../models/Booking');

async function broadcastNewListing(listing, type) {
  try {
    const subscribers = await Subscriber.find();
    if (!subscribers.length) return;
    const price = type === 'house' ? listing.pricePerNight : listing.pricePerDay;
    const priceUnit = type === 'house' ? 'night' : 'day';
    for (const sub of subscribers) {
      const unsubscribeUrl = `${process.env.BACKEND_URL}/api/subscribers/unsubscribe/${sub.unsubscribeToken}`;
      await sendEmail(
        sub.email,
        `New ${type === 'house' ? 'House' : 'Car'} on Safra: ${listing.title}`,
        buildListingBroadcastEmail({
          listingTitle: listing.title,
          listingLocation: listing.location,
          listingType: type,
          price,
          priceUnit,
          frontendUrl: process.env.FRONTEND_URL,
          unsubscribeUrl
        })
      );
    }
  } catch (err) {
    console.error('Broadcast failed:', err.message);
  }
}

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
    broadcastNewListing(house, 'house');
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
    broadcastNewListing(car, 'car');
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
    await Promise.all([
      House.deleteMany({ ownerId: user._id }),
      Car.deleteMany({ ownerId: user._id }),
      Booking.deleteMany({ userId: user._id }),
      Review.deleteMany({ userId: user._id })
    ]);
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

async function hideReview(req, res) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { hidden: true }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function unhideReview(req, res) {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { hidden: false }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

// ADMIN_MARKER_reviews
async function getAllFaqAdmin(req, res) {
  try {
    const faqs = await Faq.find().sort({ order: 1 });
    res.json(faqs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
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
    const { question, answer, order } = req.body;
    const updates = {};
    if (question !== undefined) updates.question = question;
    if (answer !== undefined) updates.answer = answer;
    if (order !== undefined) updates.order = order;
    const faq = await Faq.findByIdAndUpdate(req.params.id, updates, { new: true });
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

async function markContactMessageHandled(req, res) {
  try {
    const { handled } = req.body;
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { handled: handled === true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: 'Message not found' });
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
const SupportSettings = require('../models/SupportSettings');

async function getSupportSettings(req, res) {
  try {
    let settings = await SupportSettings.findOne();
    if (!settings) {
      settings = await SupportSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function updateSupportSettings(req, res) {
  try {
    const { supportEmail, supportPhone, supportHours, whatsappNumber } = req.body;
    let settings = await SupportSettings.findOne();
    if (!settings) {
      settings = new SupportSettings();
    }
    settings.supportEmail = supportEmail ?? settings.supportEmail;
    settings.supportPhone = supportPhone ?? settings.supportPhone;
    settings.supportHours = supportHours ?? settings.supportHours;
    settings.whatsappNumber = whatsappNumber ?? settings.whatsappNumber;
    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
const SiteSettings = require('../models/SiteSettings');

async function getSiteSettings(req, res) {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function updateSiteSettings(req, res) {
  try {
    const { siteName, logoText, currency, maintenanceMode } = req.body;
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }
    settings.siteName = siteName ?? settings.siteName;
    settings.logoText = logoText ?? settings.logoText;
    if (currency && ['USD', 'EUR', 'TND'].includes(currency)) {
      settings.currency = currency;
    }
    if (typeof maintenanceMode === 'boolean') {
      settings.maintenanceMode = maintenanceMode;
    }
    settings.updatedAt = new Date();
    await settings.save();
    res.json(settings);
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
  hideReview,
  unhideReview,
  getAllFaqAdmin,
  createFaqAdmin,
  updateFaqAdmin,
  deleteFaqAdmin,
  getAllContactMessagesAdmin,
  deleteContactMessageAdmin,
  markContactMessageHandled,
  getSupportSettings,
  updateSupportSettings,
  getSiteSettings,
  updateSiteSettings
};









