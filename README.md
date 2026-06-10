# ReelCraft AI

AI-powered Instagram content creation assistant. Upload your media → AI analyzes it, scores each asset for reel potential, then generates reel concepts, captions, hashtags, and a production checklist.

## Prerequisites

- Node.js 18+
- A **free** Groq API key — [console.groq.com/keys](https://console.groq.com/keys) (no credit card required)

## Setup

### 1. Clone and install

```bash
cd reelcraft-ai
npm install             # root (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Configure API key

Copy `.env.example` to `.env` and add your key:

```bash
cp .env.example .env
```

```
GROQ_API_KEY=your_key_here
PORT=3001
```

### 3. Start development servers

```bash
# From project root — starts both server (:3001) and client (:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Upload** — drag-and-drop as many photos (JPG/PNG/WEBP/HEIC) or videos (MP4/MOV/WEBM/M4V) as you like (processed locally in your browser); the AI ranks them and picks the best for your reel
2. **Analyze** — click "Analyze My Media" in the top bar
3. **Review** — each asset shows a reel-score badge (1–10) and content type; assets containing people get a small badge for reference
4. **Reel Concepts** — 3 AI-generated concepts appear in the right panel; expand any to see clip order, script, and music suggestions
5. **Captions** — click "Generate Captions & Hashtags" on a concept; a bottom drawer opens with 3 caption styles + 30 hashtags
6. **Create Reel Video** — click "Create Reel Video (9:16)" on a concept to stitch your uploaded clips (in the AI's clip order) into a vertical MP4, rendered entirely in your browser, then download it
7. **Export** — copy to clipboard or download the full production brief as a `.txt` file

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Groq — Llama 4 Scout (vision) + Llama 3.3 70B (text), free tier, OpenAI-compatible |
| Image processing | Browser Canvas API (client-side, no server storage) |
| Video rendering | FFmpeg.wasm (in-browser, no upload, no watermark) |
| Deployment | Vercel (serverless) |

## Project Structure

```
reelcraft-ai/
├── api/
│   └── index.js             # Vercel serverless entry point
├── client/
│   └── src/
│       ├── components/      # TopBar, UploadZone, MediaGrid, ReelConceptsPanel, CaptionDrawer, NichePanel
│       └── lib/
│           ├── api.js        # Axios wrappers
│           ├── mediaProcessor.js  # Client-side Canvas compression + video frame extraction
│           └── videoRenderer.js   # FFmpeg.wasm reel assembly (9:16 MP4, in-browser)
├── server/
│   ├── routes/
│   │   ├── analyze.js       # Vision — content scoring + people detection (informational)
│   │   └── generate.js      # Reel concepts, captions, niche detection
│   ├── utils/
│   │   └── aiClient.js      # Groq (OpenAI-compatible) client — vision + text
│   └── index.js
├── vercel.json
└── .env.example
```

## Vercel Deployment

1. Push to GitHub (already done if you cloned this)
2. Go to [vercel.com/new](https://vercel.com/new) → Import this repo
3. Add environment variable: `GROQ_API_KEY=your_key_here`
4. Deploy — Vercel builds the React client and runs Express as a serverless function

## Notes

- No server-side file storage — images are compressed to JPEG via Canvas API in the browser before being sent to the backend, keeping request sizes small and the app fully stateless
- Groq's free tier is rate-limited per minute/day; for higher volume add a paid Groq plan or override the models via `GROQ_VISION_MODEL` / `GROQ_TEXT_MODEL`
- Videos: first frame is extracted client-side via an in-browser `<video>` element + canvas
- Reel rendering runs locally via FFmpeg.wasm — your original media never leaves the browser. The ~25MB WASM core downloads once per session on first render (from the jsDelivr/unpkg CDN), then is cached
- v1 reel output is video-only (clips stitched in the AI's order, scaled/cropped to 1080×1920). Background music and burned-in text overlays are not included yet

## Troubleshooting

### `DeprecationWarning: fs.F_OK is deprecated` during build/dev

Harmless — safe to ignore. It comes from `react-scripts` (Create React App), not this app's code. On newer Node versions (18+/20+/24) CRA's tooling still calls the legacy `fs.F_OK` form. The build and app are unaffected (`Compiled successfully` prints right after it).

To silence it locally:

```bash
NODE_OPTIONS=--no-deprecation npm run dev
```

The only permanent fix is migrating off the unmaintained CRA tooling (e.g. to Vite), which is out of scope for this project.
