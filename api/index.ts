// Vercel serverless entry point. An Express app is itself a (req, res) handler,
// so the platform can invoke it directly. All routes are defined in
// server/index.ts; a rewrite in vercel.json forwards every /api/* request here
// with the original URL intact, so Express matches its own /api/... paths.
import app from '../server/index.js';

export default app;
