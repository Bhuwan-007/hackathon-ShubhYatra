const { GoogleGenerativeAI } = require("@google/generative-ai");

const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
  return new GoogleGenerativeAI(apiKey);
};

const withRetryAndTimeout = async (promiseFn, timeoutMs = 8000, maxRetries = 1) => {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('GEMINI_TIMEOUT')), timeoutMs);
      });
      
      const result = await Promise.race([promiseFn(), timeoutPromise]);
      return result;
    } catch (error) {
      attempt++;
      
      const isRateLimit = error.status === 429 || (error.message && (error.message.includes('429') || error.message.includes('quota')));
      const isTimeout = error.message === 'GEMINI_TIMEOUT';
      
      if (attempt > maxRetries || (!isRateLimit && !isTimeout)) {
        throw error;
      }
      
      // Wait before retrying
      console.warn(`⚠️ Gemini API failed (Attempt ${attempt}). Retrying in 1.5s... Error: ${error.message}`);
      await new Promise(res => setTimeout(res, 1500));
    }
  }
};

module.exports = { getGenAI, withRetryAndTimeout };
