const express = require('express');
const { getTextModel } = require('../utils/aiClient');

const router = express.Router();

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Reel Concepts ────────────────────────────────────────────────────────────

router.post('/reels', async (req, res) => {
  const { assets } = req.body;
  if (!assets || assets.length === 0) {
    return res.status(400).json({ error: 'No assets provided.' });
  }

  const assetList = assets
    .map((a, i) => `Asset ${i + 1}: [${a.contentType}] "${a.description}" — Score: ${a.reelScore}/10. Use: ${a.suggestedUse}`)
    .join('\n');

  const prompt = `You are an Instagram reel strategist. Given these assets:
${assetList}

Generate 3 distinct reel concepts. Return ONLY a valid JSON array (no markdown) with exactly 3 objects:
[{
  "title": string,
  "hook": string (first 3 seconds script),
  "clipOrder": [{ "clip": number, "startSec": number, "endSec": number, "description": string }],
  "script": string (full voiceover/text overlay script),
  "mood": string,
  "musicGenre": string,
  "musicSuggestions": [string, string, string],
  "transitions": string,
  "duration": string
}]`;

  try {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    const concepts = parseJSON(result.response.text());
    res.json({ concepts });
  } catch (err) {
    console.error('[generate/reels]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Captions & Hashtags ──────────────────────────────────────────────────────

router.post('/captions', async (req, res) => {
  const { concept } = req.body;
  if (!concept) return res.status(400).json({ error: 'No concept provided.' });

  const prompt = `Generate Instagram captions and hashtags for this reel:
Title: ${concept.title}
Mood: ${concept.mood}
Script: ${concept.script}

Return ONLY valid JSON (no markdown):
{
  "captions": [
    { "style": "short_punchy", "text": string },
    { "style": "storytelling", "text": string },
    { "style": "question", "text": string }
  ],
  "hashtags": [exactly 30 strings without # prefix, mix niche and broad],
  "postingTime": string,
  "callToAction": string
}`;

  try {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    res.json(parseJSON(result.response.text()));
  } catch (err) {
    console.error('[generate/captions]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Niche Detector ───────────────────────────────────────────────────────────

router.post('/niche', async (req, res) => {
  const { assets } = req.body;
  if (!assets || assets.length === 0) return res.status(400).json({ error: 'No assets provided.' });

  const summary = assets.map((a) => `[${a.contentType}] score:${a.reelScore} — ${a.description}`).join('\n');

  const prompt = `Based on these Instagram assets:
${summary}

Return ONLY valid JSON (no markdown):
{
  "niche": string,
  "nicheDescription": string,
  "contentPillars": [3-5 strings],
  "postingCadence": string,
  "growthTip": string
}`;

  try {
    const model = getTextModel();
    const result = await model.generateContent(prompt);
    res.json(parseJSON(result.response.text()));
  } catch (err) {
    console.error('[generate/niche]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
