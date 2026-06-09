# ReelCraft AI

AI-powered faceless Instagram content creation assistant. Upload your media → Claude analyzes it, filters out people, then generates reel concepts, captions, hashtags, and a production checklist.

## Prerequisites

- Node.js 18+
- An Anthropic API key ([get one here](https://console.anthropic.com))

## Setup

### 1. Clone and install

```bash
cd reelcraft-ai
npm install             # root (concurrently)
cd server && npm install
cd ../client && npm install
```

### 2. Configure API key

Edit `.env` in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=3001
```

### 3. Start development servers

```bash
# From project root — starts both server (3001) and client (3000)
npm run dev
```

Or run separately:

```bash
# Terminal 1
cd server && node index.js

# Terminal 2
cd client && npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. **Upload** — drag-and-drop up to 10 JPG/PNG/MP4/MOV files
2. **Analyze** — click "Analyze My Media" in the top bar
3. **Review** — flagged assets (people detected) appear with a red overlay; clean assets show a reel-score badge
4. **Reel Concepts** — 3 AI-generated concepts appear in the right panel; expand any to see clip order, script, and music
5. **Captions** — click "Generate Captions & Hashtags" on a concept; a bottom drawer opens with 3 caption styles + 30 hashtags
6. **Export** — copy captions/hashtags to clipboard, or download the full production brief as a `.txt` file

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| File uploads | Multer |
| Image processing | Sharp |
| Video frames | fluent-ffmpeg (optional) |

## Project Structure

```
reelcraft-ai/
├── client/              # React SPA
│   └── src/
│       ├── components/  # TopBar, UploadZone, MediaGrid, ReelConceptsPanel, CaptionDrawer, NichePanel
│       └── lib/api.js   # Axios wrappers for all backend calls
├── server/
│   ├── routes/
│   │   ├── upload.js    # Multer file handling
│   │   ├── analyze.js   # Per-asset Claude Vision analysis
│   │   └── generate.js  # Reel concepts, captions, niche detection
│   ├── utils/
│   │   ├── claudeClient.js  # SDK singleton
│   │   └── imageUtils.js    # Sharp resize + optional ffmpeg frame extraction
│   └── index.js
├── uploads/             # Temp file storage (not committed)
└── .env
```

## Notes

- `uploads/` is ephemeral — files persist for the session and can be cleaned up manually
- Video frame extraction requires `ffmpeg` on your PATH; without it, videos are analyzed by filename only
- All Claude calls use `claude-sonnet-4-20250514` and return structured JSON
