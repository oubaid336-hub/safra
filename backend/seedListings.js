require('dotenv').config();
const mongoose = require('mongoose');
const House = require('./models/House');
const Car = require('./models/Car');

const OWNER_ID = "6a5b2e00287eff7416250f3d";

const houses = [
  { title: "Seaside Villa in Hammamet", description: "A bright villa steps from the beach, with a private pool and terrace overlooking the Mediterranean.", location: "Hammamet", pricePerNight: 145, rooms: 3, bathrooms: 2, capacity: 6, amenities: ["WiFi", "Pool", "Air Conditioning", "Parking"], photo: "https://share.google/N7VhJxpBkVEEVzunT" },
  { title: "Medina Riad in Sousse", description: "A traditional riad tucked inside the old medina, close to the souks and the ribat.", location: "Sousse", pricePerNight: 95, rooms: 2, bathrooms: 1, capacity: 4, amenities: ["WiFi", "Terrace", "Air Conditioning"], photo: "https://share.google/uHsGE3YRS1Fcovttz" },
  { title: "Whitewashed Cliffside House in Sidi Bou Said", description: "Classic blue-and-white architecture with sweeping sea views from every room.", location: "Sidi Bou Said", pricePerNight: 180, rooms: 3, bathrooms: 2, capacity: 5, amenities: ["WiFi", "Sea View", "Air Conditioning", "Parking"], photo: "https://share.google/PNsiq0KTILjU45mfZ" },
  { title: "Modern Apartment in Downtown Tunis", description: "A clean, modern apartment close to Avenue Habib Bourguiba and the city's main sights.", location: "Tunis", pricePerNight: 70, rooms: 2, bathrooms: 1, capacity: 4, amenities: ["WiFi", "Elevator", "Air Conditioning"], photo: "https://share.google/SBwAFnx4mfIrfwID4" },
  { title: "Palm Grove Villa in Djerba", description: "A spacious family villa surrounded by palm trees, with a private pool and garden.", location: "Djerba", pricePerNight: 160, rooms: 4, bathrooms: 3, capacity: 8, amenities: ["WiFi", "Pool", "Garden", "Parking"], photo: "https://share.google/qmFtdBeG9wRTntJHa" },
  { title: "Coastal Cottage in Nabeul", description: "A cozy cottage a short walk from Nabeul's beaches and pottery markets.", location: "Nabeul", pricePerNight: 85, rooms: 2, bathrooms: 1, capacity: 4, amenities: ["WiFi", "Beach Access", "Parking"], photo: "https://share.google/c9nqFhjTL2W1LUneZ" },
  { title: "Family House in Monastir", description: "A comfortable house near the marina, great for families exploring the coast.", location: "Monastir", pricePerNight: 110, rooms: 3, bathrooms: 2, capacity: 6, amenities: ["WiFi", "Pool", "Air Conditioning"], photo: "https://share.google/SywXg3bvZHZDEERIP" },
  { title: "Quiet Retreat in Bizerte", description: "A peaceful house near Bizerte's old port, ideal for a relaxed getaway.", location: "Bizerte", pricePerNight: 90, rooms: 2, bathrooms: 2, capacity: 5, amenities: ["WiFi", "Garden", "Parking"], photo: "https://share.google/GUHl5ocUn21oQehVV" },
];

const cars = [
  { title: "Compact Hatchback in Tunis", description: "Easy to park and fuel-efficient — ideal for getting around the capital.", location: "Tunis", pricePerDay: 35, seats: 5, transmission: "automatic", fuelType: "petrol", year: 2022, photo: "https://share.google/XhBjtevzP3LaB9fxc" },
  { title: "Family SUV in Sousse", description: "Roomy SUV with plenty of trunk space, good for longer road trips.", location: "Sousse", pricePerDay: 55, seats: 7, transmission: "automatic", fuelType: "diesel", year: 2021, photo: "https://share.google/6aDJEE4Oz0Ib2pmIT" },
  { title: "Economy Sedan in Hammamet", description: "A reliable, budget-friendly sedan for day trips along the coast.", location: "Hammamet", pricePerDay: 30, seats: 5, transmission: "manual", fuelType: "petrol", year: 2020, photo: "PHOTO_URL_11" },
  { title: "Compact Electric Car in Djerba", description: "Quiet and efficient electric car, well suited to the island's short distances.", location: "Djerba", pricePerDay: 45, seats: 5, transmission: "automatic", fuelType: "electric", year: 2023, photo: "PHOTO_URL_12" },
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected.");

  for (const h of houses) {
    const doc = await House.create({
      ownerId: OWNER_ID,
      title: h.title,
      description: h.description,
      location: h.location,
      pricePerNight: h.pricePerNight,
      rooms: h.rooms,
      bathrooms: h.bathrooms,
      capacity: h.capacity,
      amenities: h.amenities,
      photos: [h.photo],
      status: "approved",
    });
    console.log("House created:", doc.title, doc._id.toString());
  }

  for (const c of cars) {
    const doc = await Car.create({
      ownerId: OWNER_ID,
      title: c.title,
      description: c.description,
      location: c.location,
      pricePerDay: c.pricePerDay,
      seats: c.seats,
      transmission: c.transmission,
      fuelType: c.fuelType,
      year: c.year,
      photos: [c.photo],
      status: "approved",
    });
    console.log("Car created:", doc.title, doc._id.toString());
  }

  console.log("Done.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
