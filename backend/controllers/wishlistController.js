const User = require('../models/User');
const House = require('../models/House');
const Car = require('../models/Car');

async function toggle(req, res) {
  try {
    const { listingId } = req.params;
    const user = await User.findById(req.user.userId);

    const index = user.wishlist.findIndex(id => id.toString() === listingId);
    if (index === -1) {
      user.wishlist.push(listingId);
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    res.json({ wishlist: user.wishlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getMine(req, res) {
  try {
    const user = await User.findById(req.user.userId);
    const houses = await House.find({ _id: { $in: user.wishlist } });
    const cars = await Car.find({ _id: { $in: user.wishlist } });
    res.json({ houses, cars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { toggle, getMine };
