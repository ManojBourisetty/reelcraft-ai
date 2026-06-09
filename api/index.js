// Vercel serverless entry point — proxies all /api/* requests to Express app
const app = require('../server/index');
module.exports = app;
