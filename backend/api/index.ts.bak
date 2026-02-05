// Vercel serverless function handler
// Import the compiled Express app from dist folder
const app = require('../dist/app').default;

module.exports = async (req, res) => {
  // Log the incoming request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Forward to Express app
  return app(req, res);
};
