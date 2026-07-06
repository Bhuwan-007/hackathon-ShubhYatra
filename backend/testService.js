require('dotenv').config();
const mongoose = require('mongoose');
const { generateSafetyBriefing } = require('./services/geminiService');

async function runTest() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to DB');
    
    console.log('\n🤖 Requesting Safety Briefing for "Paharganj" (Traveler Type: solo, elderly)...');
    console.log('Waiting for Gemini API response...');
    
    const result = await generateSafetyBriefing('Paharganj', ['solo', 'elderly']);
    
    console.log('\n✅ Successfully received JSON from Gemini:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
