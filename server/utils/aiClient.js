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

function getVisionModel() {
  return getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
}

function getTextModel() {
  return getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });
}

module.exports = { getVisionModel, getTextModel };
