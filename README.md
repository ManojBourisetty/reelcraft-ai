# ReelCraft AI

AI-powered faceless Instagram content creation assistant. Upload your media → Gemini AI analyzes it, filters out people, then generates reel concepts, captions, hashtags, and a production checklist.

## Prerequisites

- Node.js 18+
- A **free** Google AI Studio API key — [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) (no credit card required)

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
GOOGLE_AI_API_KEY=your_key_here
PORT=3001
```

### 3. Start development servers

```bash
# From project root — starts both server (:3001) and client (:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Upload** — drag-and-drop up to 10 JPG/PNG/MP4/MOV files (processed locally in your browser)
2. **Analyze** — click "Analyze My Media" in the top bar
3. **Review** — flagged assets (people detected) get a red overlay; clean assets show a reel-score badge (1–10)
4. **Reel Concepts** — 3 AI-generated concepts appear in the right panel; expand any to see clip order, script, and music suggestions
5. **Captions** — click "Generate Captions & Hashtags" on a concept; a bottom drawer opens with 3 caption styles + 30 hashtags
6. **Export** — copy to clipboard or download the full production brief as a `.txt` file

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Google Gemini 1.5 Flash (free tier — 15 RPM, 1M tokens/day) |
| Image processing | Browser Canvas API (client-side, no server storage) |
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
│           └── mediaProcessor.js  # Client-side Canvas compression + video frame extraction
├── server/
│   ├── routes/
│   │   ├── analyze.js       # Gemini Vision — people detection + content scoring
│   │   └── generate.js      # Reel concepts, captions, niche detection
│   ├── utils/
│   │   └── aiClient.js      # Gemini SDK singleton
│   └── index.js
├── vercel.json
└── .env.example
```

## Vercel Deployment

1. Push to GitHub (already done if you cloned this)
2. Go to [vercel.com/new](https://vercel.com/new) → Import this repo
3. Add environment variable: `GOOGLE_AI_API_KEY=your_key_here`
4. Deploy — Vercel builds the React client and runs Express as a serverless function

## Notes

- No server-side file storage — images are compressed to JPEG via Canvas API in the browser before being sent to the backend, keeping request sizes small and the app fully stateless
- Free Gemini tier resets daily; for higher volume upgrade to a paid Google AI Studio plan
- Videos: first frame is extracted client-side via an in-browser `<video>` element + canvas
