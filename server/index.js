// dotenv is only needed for local dev — Vercel injects env vars directly
// and may not bundle devDependencies into the serverless function.
try {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
} catch {
  // not available in production — env vars come from the platform
}

const express = require('express');
const cors = require('cors');

const analyzeRouter = require('./routes/analyze');
const generateRouter = require('./routes/generate');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : ['http://localhost:3000'];

app.use(cors({ origin: allowedOrigins, credentials: true }));

// Base64-encoded images can be ~4MB each; 10 files → up to 40MB body
app.use(express.json({ limit: '50mb' }));

app.use('/api/analyze', analyzeRouter);
app.use('/api/generate', generateRouter);

app.get('/api/health', (_, res) => res.json({ status: 'ok', model: 'gemini-1.5-flash' }));

app.use((err, req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Export for Vercel serverless
module.exports = app;

// Start local server only when not imported by Vercel
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`ReelCraft AI server on :${PORT} (Gemini 1.5 Flash)`));
}
