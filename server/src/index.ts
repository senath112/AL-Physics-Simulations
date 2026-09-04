import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Security Headers with Content Security Policy
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        frameSrc: ["https://accounts.google.com"],
        connectSrc: [
          "'self'",
          "https://accounts.google.com",
          "https://oauth2.googleapis.com",
          "https://badge.uptimerobot.com",
          "https://stats.uptimerobot.com",
        ],
        fontSrc: ["'self'", "data:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Restricted CORS Allowlist
const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  : [
      'https://physicsfromsenath.slhosted.lk',
      'http://physicsfromsenath.slhosted.lk',
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin SPA navigation, mobile clients, server-to-server)
      if (!origin) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      // Allow localhost/127.0.0.1 in non-production environments
      if (
        process.env.NODE_ENV !== 'production' &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('CORS request blocked by security policy'));
    },
    credentials: true,
  })
);

// Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Please try again later.' },
});

const mutationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Please slow down.' },
});

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(authMiddleware);

// Apply Rate Limits to API endpoints
app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/laboratory', mutationLimiter);
app.use('/api/r2', mutationLimiter);

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
