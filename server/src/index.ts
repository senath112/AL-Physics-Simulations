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

// Shared Server Friendly Port Selection:
// - Uses process.env.PORT or process.env.SERVER_PORT if provided (e.g. Passenger / hosting panel).
// - For local/standalone runs, avoids common ports like 3000, 3001, 8000, 8080 (which conflict on shared servers)
//   by defaulting to an uncommon high ephemeral/private port: 48293.
// - If explicitly set to '0' or dynamic, dynamically binds to any free port assigned by OS.
const UNCOMMON_DEFAULT_PORT = 48293;
const envPort = process.env.PORT || process.env.SERVER_PORT;
const PORT: number | string = envPort !== undefined 
  ? (isNaN(Number(envPort)) ? envPort : Number(envPort)) 
  : (Number(process.env.DEV_PORT) || UNCOMMON_DEFAULT_PORT);

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

// Start Server (Listener on dynamic process.env.PORT, custom port, or OS-assigned free port)
const server = app.listen(PORT, () => {
  const addr = server.address();
  const actualPort = typeof addr === 'object' && addr !== null ? addr.port : PORT;
  const isPassenger = typeof PORT === 'string' && (PORT === 'passenger' || PORT.startsWith('/'));
  const listenInfo = isPassenger ? `Passenger Socket (${PORT})` : `http://localhost:${actualPort}`;

  console.log(`=================================================================`);
  console.log(`Physics by Senath - Node.js Server Running`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Listening on: ${listenInfo} (Port: ${actualPort})`);
  if (!isPassenger) {
    console.log(`Health Check: http://localhost:${actualPort}/api/health`);
  }
  console.log(`=================================================================`);
});

// Automatic collision fallback on shared servers: if requested port is in use, bind to any available free port
server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE' && PORT !== 0) {
    console.warn(`[WARN] Port ${PORT} is currently in use on this shared server. Finding an available free port...`);
    const fallbackServer = app.listen(0, () => {
      const fallbackAddr = fallbackServer.address();
      const freePort = typeof fallbackAddr === 'object' && fallbackAddr !== null ? fallbackAddr.port : 0;
      console.log(`[INFO] Server successfully re-bound to available port: http://localhost:${freePort}`);
      console.log(`[INFO] Health Check: http://localhost:${freePort}/api/health`);
    });
  } else {
    console.error(`[ERROR] Server failed to start:`, err);
  }
});

export default app;
