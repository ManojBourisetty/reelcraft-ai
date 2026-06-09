import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

export async function analyzeMedia(files) {
  const { data } = await axios.post(`${BASE}/analyze`, { files }, {
    timeout: 120000, // 2 min — 10 images through Gemini can take a while
  });
  return data;
}

export async function generateReels(assets) {
  const { data } = await axios.post(`${BASE}/generate/reels`, { assets });
  return data;
}

export async function generateCaptions(concept) {
  const { data } = await axios.post(`${BASE}/generate/captions`, { concept });
  return data;
}

export async function detectNiche(assets) {
  const { data } = await axios.post(`${BASE}/generate/niche`, { assets });
  return data;
}
