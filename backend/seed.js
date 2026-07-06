require('dotenv').config();
const mongoose = require('mongoose');
const DestinationRisk = require('./models/DestinationRisk');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shubhyatra';

const seedData = [
  {
    location: "Paharganj, Delhi, India",
    overall_risk_score: 75,
    active_scams: ["Fake Tourist Office", "Overpriced Taxis", "Hotel Bait and Switch"],
    safe_zones: ["Main Bazaar Road (during daytime)", "New Delhi Railway Station Police Booth"],
    embedding: [],
    last_updated: new Date()
  },
  {
    location: "Montmartre, Paris, France",
    overall_risk_score: 60,
    active_scams: ["String Bracelet Scam", "Fake Petition", "Pickpocketing"],
    safe_zones: ["Sacré-Cœur interior", "Place des Abbesses"],
    embedding: [],
    last_updated: new Date()
  },
  {
    location: "Khao San Road, Bangkok, Thailand",
    overall_risk_score: 65,
    active_scams: ["Tuk-Tuk gem scam", "Ping pong show extortion", "Fake Baht notes"],
    safe_zones: ["Official Tourist Police stations", "Main walking street near big hotels"],
    embedding: [],
    last_updated: new Date()
  }
];

async function seedDB() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🧹 Clearing existing DestinationRisk data...');
    await DestinationRisk.deleteMany({});

    console.log('🌱 Inserting seed data...');
    await DestinationRisk.insertMany(seedData);

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:');
    console.error(error.message);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
