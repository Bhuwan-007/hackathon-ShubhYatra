const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getGenAI, withRetryAndTimeout } = require('../utils/geminiHelper');
const DestinationRisk = require('../models/DestinationRisk');
const UserReport = require('../models/UserReport');

async function generateSafetyBriefing(location, travelerType = []) {
  let backgroundData = { destinationContext: null, recentReports: [] };
  
  try {
    // 1. Query MongoDB for closest matching DestinationRisk
    // NOTE: In a real implementation, this is where we'd use MongoDB Vector Search on the `embedding` field!
    // For now, doing a simple regex text search for the demo.
    const riskDocs = await DestinationRisk.find({ 
      location: { $regex: location, $options: 'i' } 
    }).limit(1);
    
    backgroundData.destinationContext = riskDocs.length > 0 ? riskDocs[0] : null;
    
    // 2. Pull recent verified UserReport documents for that location
    const reports = await UserReport.find({
      location: { $regex: location, $options: 'i' },
      status: 'verified'
    })
    .populate('authorId', 'isVerified') // Populate to see if author is verified
    .sort({ reportedAt: -1 })
    .limit(10); // Fetch a few more to filter/weight

    // Sort/weight so that reports from verified authors bubble to the top of the context
    // This honors the "Safety Buddy" opt-in verification signal during AI briefing generation
    reports.sort((a, b) => {
      const aVerified = a.authorId && a.authorId.isVerified ? 1 : 0;
      const bVerified = b.authorId && b.authorId.isVerified ? 1 : 0;
      return bVerified - aVerified;
    });

    backgroundData.recentReports = reports.slice(0, 5); // Keep the top 5 for the prompt

    const genAI = getGenAI();
    // If Gemini key is missing, fallback immediately
    if (!genAI) {
      console.warn("⚠️ GEMINI_API_KEY is missing or invalid. Returning fallback briefing.");
      return getFallbackBriefing(location, travelerType, backgroundData);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert AI tourist safety advisor. Based on the following background data and the user's traveler type, synthesize a safety briefing for ${location}.
You MUST respond with strictly valid JSON only. Do not include markdown formatting like \`\`\`json.

Location: ${location}
Traveler Type: ${travelerType.length > 0 ? travelerType.join(', ') : 'standard'}
Background Data from Database: ${JSON.stringify(backgroundData)}

Generate a JSON object with EXACTLY these fields:
{
  "overall_risk_score": <number 0-100 based on data>,
  "active_scams": [<array of strings summarizing scams>],
  "safe_zones": [<array of strings of safe areas>],
  "emergency_contacts": {
    "police": "<number string>",
    "ambulance": "<number string>",
    "nearest_embassy": "<details string>"
  },
  "accessibility_notes": [<array of strings tailored SPECIFICALLY to the travelerType. E.g. extra caution for solo, step-free for disabled>]
}
`;
    const result = await withRetryAndTimeout(() => model.generateContent(prompt), 8000, 1);
    const textResult = result.response.text();
    
    // 4. Defensively parse JSON (strip markdown fences if present)
    let jsonText = textResult.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    }

    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response as JSON:", textResult);
      throw new Error("Invalid JSON format returned from Gemini");
    }

  } catch (error) {
    console.error("❌ Error generating safety briefing:", error);
    // Return fallback instead of crashing
    return getFallbackBriefing(location, travelerType, backgroundData);
  }
}

function getFallbackBriefing(location, travelerType, backgroundData = {}) {
  // Mock fallback so the demo still works offline or on API failure
  const dest = backgroundData?.destinationContext;
  return {
    overall_risk_score: dest?.overall_risk_score || 50,
    active_scams: dest?.active_scams?.length > 0 ? dest.active_scams : ["Generic pickpocketing", "Overpriced tourist traps"],
    safe_zones: dest?.safe_zones?.length > 0 ? dest.safe_zones : ["Main well-lit tourist streets", "Hotel lobbies"],
    emergency_contacts: {
      police: "112 / 911",
      ambulance: "112 / 911",
      nearest_embassy: "Check your local consulate website"
    },
    accessibility_notes: [
      `Stay vigilant in crowded areas in ${location}.`,
      travelerType.includes('solo') ? "As a solo traveler, avoid unlit alleys at night and share your itinerary with someone." : "Keep your group together.",
      travelerType.includes('disabled') ? "Research step-free access in advance as historic areas may lack ramps." : "Standard precautions apply."
    ].filter(Boolean)
  };
}

const generateEmergencyPlan = async (location, landmarks, emergencyType) => {
  try {
    const genAI = getGenAI();
    if (!genAI) {
      console.warn("⚠️ GEMINI_API_KEY missing. Returning fallback emergency plan.");
      return getFallbackEmergencyPlan(location, emergencyType);
    }
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
You are an expert AI crisis manager and local guide. A tourist is experiencing an emergency or is lost, and needs an immediate action plan.
General Location: ${location}
${landmarks ? `Specific Landmarks/Surroundings: ${landmarks}` : ''}
Emergency Type: ${emergencyType}

If the emergency type is 'lost_directions', use the provided landmarks to give them immediate, step-by-step directions to a safe, well-lit main street or a major transit hub.

Respond with strictly valid JSON only. Do not include markdown formatting like \`\`\`json.
Generate a JSON object with EXACTLY these fields:
{
  "steps": ["Step 1: Immediate action or direction", "Step 2: Who to contact or where to walk", "Step 3: What to look out for"],
  "key_contacts": {
    "police": "local number",
    "medical_or_other": "local number or advice",
    "embassy_advice": "what to search or where to go"
  }
}
`;
    const result = await withRetryAndTimeout(() => model.generateContent(prompt), 8000, 1);
    let jsonText = result.response.text().trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    }
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("❌ Error generating emergency plan:", error);
    return getFallbackEmergencyPlan(location, emergencyType);
  }
};

function getFallbackEmergencyPlan(location, emergencyType) {
  return {
    steps: [
      "Move to a safe, well-lit public area immediately.",
      `Report the ${emergencyType.replace('_', ' ')} to the local authorities.`,
      "Contact your country's embassy or consulate for emergency support."
    ],
    key_contacts: {
      police: "112 / 911",
      medical_or_other: "112 / 911",
      embassy_advice: "Check your government's travel website for local embassy details."
    }
  };
}

module.exports = { generateSafetyBriefing, generateEmergencyPlan };
