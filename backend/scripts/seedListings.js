const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const House = require("../models/House");
const Car = require("../models/Car");

const houses = [
  {
    title: "test",
    description: "Test house listing",
    location: "Tunis",
    pricePerNight: 120,
    photos: ["https://picsum.photos/seed/safra-house1/800/600"],
    rooms: 3,
    bathrooms: 2,
    capacity: 6,
    amenities: ["wifi", "parking"],
    status: "approved"
  },
  {
    title: "test",
    description: "Test house listing",
    location: "Sousse",
    pricePerNight: 90,
    photos: ["https://picsum.photos/seed/safra-house2/800/600"],
    rooms: 2,
    bathrooms: 1,
    capacity: 4,
    amenities: ["wifi", "pool"],
    status: "approved"
  },
  {
    title: "test",
    description: "Test house listing",
    location: "Hammamet",
    pricePerNight: 150,
    photos: ["https://picsum.photos/seed/safra-house3/800/600"],
    rooms: 4,
    bathrooms: 3,
    capacity: 8,
    amenities: ["wifi", "parking", "pool"],
    status: "approved"
  },
  {
    title: "test",
    description: "Test house listing",
    location: "Djerba",
    pricePerNight: 200,
    photos: ["https://picsum.photos/seed/safra-house4/800/600"],
    rooms: 5,
    bathrooms: 3,
    capacity: 10,
    amenities: ["wifi", "parking", "pool", "ac"],
    status: "approved"
  }
];

const cars = [
  {
    title: "test",
    description: "Test car listing",
    location: "Tunis",
    pricePerDay: 40,
    photos: ["https://picsum.photos/seed/safra-car1/800/600"],
    seats: 5,
    transmission: "automatic",
    fuelType: "petrol",
    status: "approved"
  },
  {
    title: "test",
    description: "Test car listing",
    location: "Sfax",
    pricePerDay: 60,
    photos: ["https://picsum.photos/seed/safra-car2/800/600"],
    seats: 7,
    transmission: "manual",
    fuelType: "diesel",
    status: "approved"
  }
];

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check backend/.env has a MONGO_URI= line.");
  }
  await mongoose.connect(process.env.MONGO_URI);
  await House.deleteMany({});
  await Car.deleteMany({});
  await House.insertMany(houses);
  await Car.insertMany(cars);
  console.log("houses:", await House.countDocuments());
  console.log("cars:", await Car.countDocuments());
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
