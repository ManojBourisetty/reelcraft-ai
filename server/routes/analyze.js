const express = require('express');
const { generateVision, generateText } = require('../utils/aiClient');

const router = express.Router();

const ANALYSIS_PROMPT = `You are a content analysis AI for an Instagram reel creation tool. Analyze this image.
Return ONLY valid JSON — no markdown fences, no extra text — with exactly these fields:
{
  "hasPeople": boolean,
  "contentType": string (e.g. "food", "scenery", "architecture", "nature", "objects", "aesthetic"),
  "reelScore": number between 1 and 10,
  "description": string (1-2 sentences describing the content),
  "suggestedUse": string (how to use this in a reel)
}`;

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Small pause between sequential Groq calls so a batch of images doesn't
// burst past Groq's free-tier per-minute rate limit, which previously caused
// a chunk of mid/late-batch images to fail with no remaining retries.
const INTER_CALL_DELAY_MS = 350;

async function analyzeAsset(file) {
  const isVideo = file.isVideo;

  if (!file.base64) {
    // Video with no extractable frame — infer from filename (text-only)
    const text = await generateText(
      `This is a video file named "${file.originalName}". No frame was extractable. Based on the filename, make your best inference. ${ANALYSIS_PROMPT}`
    );
    return parseJSON(text);
  }

  // file.base64 is a browser-compressed JPEG (video frames are also JPEG)
  const prompt = isVideo
    ? `This is a frame extracted from a video file. ${ANALYSIS_PROMPT}`
    : ANALYSIS_PROMPT;

  const text = await generateVision({ prompt, base64: file.base64, mimeType: 'image/jpeg' });
  return parseJSON(text);
}

router.post('/', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files to analyze.' });
  }

  const results = [];
  for (let i = 0; i < files.length; i++) {
    if (i > 0) await sleep(INTER_CALL_DELAY_MS);
    const file = files[i];
    try {
      const analysis = await analyzeAsset(file);
      results.push({ ...file, base64: undefined, analysis, error: null });
    } catch (err) {
      console.error(`[analyze] ${file.originalName}:`, err.message);
      results.push({ ...file, base64: undefined, analysis: null, error: err.message });
    }
  }

  res.json({ results });
});

module.exports = router;
