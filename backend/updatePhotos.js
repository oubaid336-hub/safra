require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary'); // adjust path if your file lives elsewhere
const House = require('./models/House');
const Car = require('./models/Car');

const housePhotos = {
  "Seaside Villa in Hammamet": "https://images.pexels.com/photos/29453302/pexels-photo-29453302.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Medina Riad in Sousse": "https://images.pexels.com/photos/31356131/pexels-photo-31356131.png?auto=compress&cs=tinysrgb&w=1260",
  "Whitewashed Cliffside House in Sidi Bou Said": "https://images.pexels.com/photos/6306940/pexels-photo-6306940.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Modern Apartment in Downtown Tunis": "https://images.pexels.com/photos/21284473/pexels-photo-21284473.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Palm Grove Villa in Djerba": "https://images.pexels.com/photos/4497544/pexels-photo-4497544.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Coastal Cottage in Nabeul": "https://images.pexels.com/photos/27429688/pexels-photo-27429688.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Family House in Monastir": "https://images.pexels.com/photos/8583638/pexels-photo-8583638.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Quiet Retreat in Bizerte": "https://images.pexels.com/photos/17922976/pexels-photo-17922976.jpeg?auto=compress&cs=tinysrgb&w=1260",
};

const carPhotos = {
  "Compact Hatchback in Tunis": "https://images.pexels.com/photos/27138967/pexels-photo-27138967.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Family SUV in Sousse": "https://images.pexels.com/photos/13767773/pexels-photo-13767773.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Economy Sedan in Hammamet": "https://images.pexels.com/photos/11329085/pexels-photo-11329085.jpeg?auto=compress&cs=tinysrgb&w=1260",
  "Compact Electric Car in Djerba": "https://images.pexels.com/photos/35736786/pexels-photo-35736786.jpeg?auto=compress&cs=tinysrgb&w=1260",
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  for (const [title, url] of Object.entries(housePhotos)) {
    const uploaded = await cloudinary.uploader.upload(url, { folder: "safra/houses" });
    const result = await House.updateMany({ title }, { $set: { photos: [uploaded.secure_url] } });
    console.log("House updated:", title, "->", uploaded.secure_url, `(matched ${result.matchedCount})`);
  }

  for (const [title, url] of Object.entries(carPhotos)) {
    const uploaded = await cloudinary.uploader.upload(url, { folder: "safra/cars" });
    const result = await Car.updateMany({ title }, { $set: { photos: [uploaded.secure_url] } });
    console.log("Car updated:", title, "->", uploaded.secure_url, `(matched ${result.matchedCount})`);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});