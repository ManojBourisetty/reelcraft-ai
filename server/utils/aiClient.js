const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

function getClient() {
  if (!genAI) {
    const key = process.env.GOOGLE_AI_API_KEY;
    if (!key || key === 'your_key_here') {
      throw new Error('GOOGLE_AI_API_KEY is not configured. Add it to your .env file. Get a free key at https://aistudio.google.com/app/apikey');
    }
    genAI = new GoogleGenerativeAI(key);
  }
  return genAI;
}

// gemini-1.5-flash was retired by Google; gemini-2.0-flash is the current
// free-tier vision+text model supported by the v1beta API.
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getVisionModel() {
  return getClient().getGenerativeModel({ model: MODEL });
}

function getTextModel() {
  return getClient().getGenerativeModel({ model: MODEL });
}

module.exports = { getVisionModel, getTextModel };
