import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '/api';

// Send analysis in small batches so we stay under Vercel's ~4.5MB request-body
// limit and pace requests against the Groq free-tier rate limit. This lets the
// app accept an unlimited number of uploads. Smaller batches (2) leave more
// headroom under Vercel's 60s function timeout for per-image retries when
// Groq's free-tier rate limit kicks in on large uploads.
const ANALYZE_BATCH_SIZE = 2;

export async function analyzeMedia(files, onProgress) {
  const results = [];
  for (let i = 0; i < files.length; i += ANALYZE_BATCH_SIZE) {
    const batch = files.slice(i, i + ANALYZE_BATCH_SIZE);
    const { data } = await axios.post(`${BASE}/analyze`, { files: batch }, {
      timeout: 120000,
    });
    results.push(...(data.results || []));
    onProgress?.(Math.min(i + batch.length, files.length), files.length);
  }
  return { results };
}

export async function generateReels(assets, length = 'medium') {
  const { data } = await axios.post(`${BASE}/generate/reels`, { assets, length });
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
