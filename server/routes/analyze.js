const express = require('express');
const { getVisionModel } = require('../utils/aiClient');

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

async function analyzeAsset(file) {
  const model = getVisionModel();

  // file.base64 is a browser-compressed JPEG base64 string
  const mimeType = file.mimeType?.startsWith('video/') ? 'image/jpeg' : (file.mimeType || 'image/jpeg');
  const isVideo = file.isVideo;

  if (!file.base64) {
    // Video with no extractable frame — infer from filename
    const result = await model.generateContent([
      `This is a video file named "${file.originalName}". No frame was extractable. Based on the filename, make your best inference. ${ANALYSIS_PROMPT}`
    ]);
    return parseJSON(result.response.text());
  }

  const parts = [
    { inlineData: { data: file.base64, mimeType: 'image/jpeg' } },
    { text: isVideo ? `This is a frame extracted from a video file. ${ANALYSIS_PROMPT}` : ANALYSIS_PROMPT },
  ];

  const result = await model.generateContent(parts);
  return parseJSON(result.response.text());
}

router.post('/', async (req, res) => {
  const { files } = req.body;
  if (!files || !Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files to analyze.' });
  }

  const results = [];
  for (const file of files) {
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
