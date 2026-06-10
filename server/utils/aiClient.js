/**
 * Groq AI client (OpenAI-compatible Chat Completions API).
 * Free tier, no credit card — get a key at https://console.groq.com/keys
 *
 * Llama 4 Scout is multimodal, so it handles both image vision (analysis)
 * and text generation. Models are overridable via env vars.
 */

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const VISION_MODEL = process.env.GROQ_VISION_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct';
const TEXT_MODEL = process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile';

function getKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Get a free key at https://console.groq.com/keys and add it to your environment.'
    );
  }
  return key;
}

// Groq's free tier enforces per-minute rate limits; bursts of vision calls
// (e.g. analyzing many images back-to-back) can hit 429s mid-batch. Retry
// those with backoff (honoring Retry-After) so transient limits don't fail
// individual assets outright.
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 12000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chat(model, messages) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, temperature: 0.7 }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('Groq API returned an empty response.');
      return text;
    }

    if (res.status === 429 && attempt < MAX_RETRIES) {
      const retryAfter = parseFloat(res.headers.get('retry-after'));
      const delayMs = Math.min(
        Number.isFinite(retryAfter) ? retryAfter * 1000 : 2 ** attempt * 1000,
        MAX_BACKOFF_MS
      );
      await sleep(delayMs);
      continue;
    }

    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(`Groq API ${res.status}: ${detail}`);
  }
}

/**
 * Analyze an image. base64 is a raw (no data-URL prefix) JPEG string.
 * @returns {Promise<string>} model text output
 */
function generateVision({ prompt, base64, mimeType = 'image/jpeg' }) {
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
      ],
    },
  ];
  return chat(VISION_MODEL, messages);
}

/**
 * Text-only generation.
 * @returns {Promise<string>} model text output
 */
function generateText(prompt) {
  return chat(TEXT_MODEL, [{ role: 'user', content: prompt }]);
}

module.exports = { generateVision, generateText, VISION_MODEL, TEXT_MODEL };
