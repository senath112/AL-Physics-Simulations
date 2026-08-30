import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import healthRouter from './routes/health';
import authRouter from './routes/auth';
import r2Router from './routes/r2';
import laboratoryRouter from './routes/laboratory';
import { authMiddleware } from './middleware/auth';

// Automatic, Passenger-compatible Port Selection:
// Uses process.env.PORT directly when provided dynamically by Plesk / Phusion Passenger.
// Fallbacks to 3001 for local development when process.env.PORT is omitted.
const PORT = process.env.PORT || 3001;

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(authMiddleware);

// API Router Mounting (Registered before SPA fallback)
app.use('/api', healthRouter);
app.use('/api', authRouter);
app.use('/api', r2Router);
app.use('/api', laboratoryRouter);

// Robust path resolution for Vite production static build directory
const possibleDistPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../dist'),
];

const distPath = possibleDistPaths.find(p => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) || possibleDistPaths[0];

// Serve static assets from Vite production build
app.use(express.static(distPath));

// SPA Catch-all Fallback: serve dist/index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Production frontend build (dist/index.html) not found. Please run "npm run build".');
  }
});

// Start Server (Single listener on dynamic process.env.PORT or fallback port 3001)
app.listen(PORT, () => {
  const isPassenger = typeof PORT === 'string' && (PORT === 'passenger' || PORT.startsWith('/'));
  const listenInfo = isPassenger ? `Passenger Socket (${PORT})` : `http://localhost:${PORT}`;

  console.log(`=================================================================`);
  console.log(`Physics by Senath - Node.js / Plesk Server Running`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on: ${listenInfo}`);
  if (!isPassenger) {
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
  }
  console.log(`=================================================================`);
});

export default app;
