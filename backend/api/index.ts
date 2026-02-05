import { Request, Response } from '@vercel/node';
import app from '../src/app';

// Vercel serverless function handler
export default async (req: Request, res: Response) => {
  // Log the incoming request for debugging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Forward to Express app
  return app(req, res);
};
