const Car = require('../models/Car');

async function getAll(req, res) {
  try {
    const { location, minPrice, maxPrice, seats } = req.query;
    const filter = { status: 'approved' };

    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (seats) filter.seats = { $gte: Number(seats) };

    const cars = await Car.find(filter);
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function getOne(req, res) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function create(req, res) {
  try {
    const { title, description, location, pricePerDay, seats, transmission, fuelType } = req.body;
    const photos = req.files ? req.files.map(file => file.path) : [];

    const car = await Car.create({
      ownerId: req.user.userId,
      title,
      description,
      location,
      pricePerDay,
      seats,
      transmission,
      fuelType,
      photos
    });

    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function update(req, res) {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    if (car.ownerId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed to edit this listing' });
    }

    Object.assign(car, req.body);
    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

async function deleteCar(req, res) {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car not found' });
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
}

module.exports = { getAll, getOne, create, update, delete: deleteCar };
