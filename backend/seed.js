require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const DestinationRisk = require('./models/DestinationRisk');
const UserProfile = require('./models/UserProfile');

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

    console.log('👑 Seeding admin account...');
    const adminEmail = 'admin@shubhyatra.com';
    let admin = await UserProfile.findOne({ email: adminEmail });
    if (!admin) {
      const passwordHash = await bcrypt.hash('adminpassword123', 10);
      admin = new UserProfile({
        email: adminEmail,
        passwordHash,
        displayName: 'Admin User',
        isAdmin: true,
        isVerified: true
      });
      await admin.save();
    } else {
      admin.isAdmin = true;
      await admin.save();
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error during seeding:');
    console.error(error.message);
  } finally {
    mongoose.connection.close();
  }
}

seedDB();
