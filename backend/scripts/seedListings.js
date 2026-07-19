const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");
const House = require("../models/House");
const Car = require("../models/Car");

async function uploadPhoto(seed) {
  const result = await cloudinary.uploader.upload(
    `https://picsum.photos/seed/${seed}/800/600`,
    { folder: "safra/test" }
  );
  return result.secure_url;
}

async function seed() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Check backend/.env has a MONGO_URI= line.");
  }

  const [h1, h2, h3, h4, c1, c2] = await Promise.all([
    uploadPhoto("safra-house1"),
    uploadPhoto("safra-house2"),
    uploadPhoto("safra-house3"),
    uploadPhoto("safra-house4"),
    uploadPhoto("safra-car1"),
    uploadPhoto("safra-car2")
  ]);

  const houses = [
    { title: "test", description: "Test house listing", location: "Tunis", pricePerNight: 120, photos: [h1], rooms: 3, bathrooms: 2, capacity: 6, amenities: ["wifi", "parking"], status: "approved" },
    { title: "test", description: "Test house listing", location: "Sousse", pricePerNight: 90, photos: [h2], rooms: 2, bathrooms: 1, capacity: 4, amenities: ["wifi", "pool"], status: "approved" },
    { title: "test", description: "Test house listing", location: "Hammamet", pricePerNight: 150, photos: [h3], rooms: 4, bathrooms: 3, capacity: 8, amenities: ["wifi", "parking", "pool"], status: "approved" },
    { title: "test", description: "Test house listing", location: "Djerba", pricePerNight: 200, photos: [h4], rooms: 5, bathrooms: 3, capacity: 10, amenities: ["wifi", "parking", "pool", "ac"], status: "approved" }
  ];

  const cars = [
    { title: "test", description: "Test car listing", location: "Tunis", pricePerDay: 40, photos: [c1], seats: 5, transmission: "automatic", fuelType: "petrol", status: "approved" },
    { title: "test", description: "Test car listing", location: "Sfax", pricePerDay: 60, photos: [c2], seats: 7, transmission: "manual", fuelType: "diesel", status: "approved" }
  ];

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
