const House = require('../models/House');

async function getAll(req, res) {
  try {
    const { location, minPrice, maxPrice, capacity } = req.query;
    const filter = { status: 'approved' };

    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) filter.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerNight.$lte = Number(maxPrice);
    }
    if (capacity) filter.capacity = { $gte: Number(capacity) };

    const houses = await House.find(filter);
    res.json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getOne(req, res) {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { title, description, location, pricePerNight, rooms, bathrooms, capacity, amenities } = req.body;
    const photos = req.files ? req.files.map(file => file.path) : [];

    const house = await House.create({
      ownerId: req.user.userId,
      title,
      description,
      location,
      pricePerNight,
      rooms,
      bathrooms,
      capacity,
      amenities: amenities ? amenities.split(',').map(a => a.trim()) : [],
      photos
    });

    res.status(201).json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function update(req, res) {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ message: 'House not found' });

    if (house.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to edit this listing' });
    }

    Object.assign(house, req.body);
    await house.save();
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteHouse(req, res) {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) return res.status(404).json({ message: 'House not found' });
    res.json({ message: 'House deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { getAll, getOne, create, update, delete: deleteHouse };
