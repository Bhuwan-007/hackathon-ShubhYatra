const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getGenAI, withRetryAndTimeout } = require('../utils/geminiHelper');

const getFallbackScanResult = () => {
  return {
    is_suspicious: true,
    confidence: 85,
    explanation: "[MOCK FALLBACK] The image appears to show an unofficial meter or badge, which is a common pattern for tourist scams in this location.",
    recommended_action: "Avoid engaging and find an official, clearly marked service instead."
  };
};

const scanImage = async (req, res) => {
  try {
    const { location, user_notes } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No image provided. Please upload an image field.' });
    }

    const genAI = getGenAI();

    // If Gemini key is missing, fallback immediately
    if (!genAI) {
      console.warn("⚠️ GEMINI_API_KEY is missing or invalid. Returning fallback scan result.");
      return res.json(getFallbackScanResult());
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Prepare image data for Gemini API
    const imagePart = {
      inlineData: {
        data: file.buffer.toString("base64"),
        mimeType: file.mimetype
      }
    };

    const prompt = `
You are an expert AI tourist safety advisor. Analyze the provided image to identify if it shows a common tourist scam pattern (e.g., fake taxi meter, unofficial guide badge, altered signage, overpriced menu).
Context location: ${location || 'Unknown'}
${user_notes ? `Additional context from the user: "${user_notes}"` : ''}

You MUST respond with strictly valid JSON only. Do not include markdown formatting like \`\`\`json.

Generate a JSON object with EXACTLY these fields:
{
  "is_suspicious": <boolean>,
  "confidence": <number 0-100>,
  "explanation": "<string explaining exactly why it looks suspicious or safe>",
  "recommended_action": "<string advising the user what to do next>"
}
`;

    // Gemini API call (multimodal: prompt + image) with retry and timeout
    const result = await withRetryAndTimeout(() => model.generateContent([prompt, imagePart]), 8000, 1);
    const textResult = result.response.text();
    
    // Defensively parse JSON (strip markdown fences if present)
    let jsonText = textResult.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    }

    try {
      const parsedData = JSON.parse(jsonText);
      return res.json(parsedData);
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response as JSON:", textResult);
      throw new Error("Invalid JSON format returned from Gemini");
    }

  } catch (error) {
    console.error("❌ Error scanning image:", error);
    // Return fallback instead of crashing
    return res.json(getFallbackScanResult());
  }
};

module.exports = {
  scanImage
};
