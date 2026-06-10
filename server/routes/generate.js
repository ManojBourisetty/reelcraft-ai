const express = require('express');
const { generateText } = require('../utils/aiClient');

const router = express.Router();

function parseJSON(text) {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

// ── Reel Concepts ────────────────────────────────────────────────────────────

// Reel length presets — target duration + clip count guidance for the model.
const LENGTH_PRESETS = {
  short: { label: 'short', seconds: '12–20 seconds', clips: '3–5 clips', minClips: 3 },
  medium: { label: 'medium', seconds: '25–40 seconds', clips: '6–10 clips', minClips: 6 },
  long: { label: 'long', seconds: '50–75 seconds', clips: '12–20 clips', minClips: 12 },
};

// Ensure clipOrder never repeats an asset, even if clips outnumber assets.
// Each asset may appear at most once across clipOrder; if the model returns
// a duplicate or out-of-range clip reference, reassign it to an unused asset
// when one is available, otherwise drop that clip entirely (a shorter reel
// beats a repeated clip).
function dedupeClipOrder(clipOrder, assetCount) {
  if (!Array.isArray(clipOrder) || assetCount === 0) return clipOrder;

  const usedSet = new Set();
  const unused = [];
  for (let i = 1; i <= assetCount; i++) unused.push(i);

  const result = [];
  for (const entry of clipOrder) {
    const clip = entry.clip;
    const isValidUnused = clip >= 1 && clip <= assetCount && !usedSet.has(clip);

    if (isValidUnused) {
      usedSet.add(clip);
      unused.splice(unused.indexOf(clip), 1);
      result.push(entry);
      continue;
    }

    if (unused.length > 0) {
      const next = unused.shift();
      usedSet.add(next);
      result.push({ ...entry, clip: next });
      continue;
    }

    // No unused assets left — drop this clip rather than repeat one.
  }

  return result;
}

router.post('/reels', async (req, res) => {
  const { assets, length } = req.body;
  if (!assets || assets.length === 0) {
    return res.status(400).json({ error: 'No assets provided.' });
  }

  const preset = LENGTH_PRESETS[length] || LENGTH_PRESETS.medium;

  const assetList = assets
    .map((a, i) => `Asset ${i + 1}: [${a.contentType}] "${a.description}" — Score: ${a.reelScore}/10. Use: ${a.suggestedUse}`)
    .join('\n');

  const repeatGuidance = assets.length >= preset.minClips
    ? `There are ${assets.length} assets available — that's enough to cover a ${preset.label} reel without repeats. Use each asset at most once across clipOrder.`
    : `There are only ${assets.length} assets available, fewer than the ${preset.clips} target for a ${preset.label} reel. Use each asset at most once across clipOrder (no repeats) — the reel will simply be shorter than the ${preset.label} target, using all ${assets.length} assets.`;

  const prompt = `You are an Instagram reel strategist. These assets are pre-ranked by reel-score (higher = stronger):
${assetList}

Target a ${preset.label} reel: about ${preset.seconds} long, roughly ${preset.clips}. SELECT the strongest, most cohesive assets (favor higher scores) and arrange them to fit this length. ${repeatGuidance} Reference assets by their "Asset N" number in clipOrder using the "clip" field, and make the "duration" field reflect the ${preset.label} target.

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
    const text = await generateText(prompt);
    const concepts = parseJSON(text);
    const deduped = concepts.map((c) => ({
      ...c,
      clipOrder: dedupeClipOrder(c.clipOrder, assets.length),
    }));
    res.json({ concepts: deduped });
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
    const text = await generateText(prompt);
    res.json(parseJSON(text));
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
    const text = await generateText(prompt);
    res.json(parseJSON(text));
  } catch (err) {
    console.error('[generate/niche]', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
