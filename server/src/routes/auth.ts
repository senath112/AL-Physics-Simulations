import { Router, Response } from 'express';
import { AuthenticatedRequest, parseSessionCookie } from '../middleware/auth';
import pool from '../services/db';

const router = Router();

function generateInternalId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "usr_";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/auth/google
router.post('/auth/google', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { idToken } = req.body || {};
    if (!idToken || typeof idToken !== 'string') {
      res.status(400).json({ error: 'Missing or invalid Google ID token' });
      return;
    }

    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const verifyRes = await fetch(googleVerifyUrl);

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      res.status(401).json({ error: 'Invalid Google ID token signature or expired token', details: errData });
      return;
    }

    const payload = await verifyRes.json();
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      res.status(401).json({ error: 'Invalid token issuer' });
      return;
    }

    const expectedClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      res.status(401).json({ error: 'Token audience does not match configured Google Client ID' });
      return;
    }

    const googleSub = payload.sub;
    const email = payload.email || '';
    const name = payload.name || 'Physics Student';
    const picture = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

    let userId = '';
    let savedPracticalsCount = 0;

    // Database user upsert
    try {
      const [rows]: any = await pool.query('SELECT id FROM users WHERE google_sub = ?', [googleSub]);
      if (rows && rows.length > 0) {
        userId = rows[0].id;
        await pool.query('UPDATE users SET name = ?, picture = ?, last_login_at = NOW() WHERE id = ?', [name, picture, userId]);
      } else {
        userId = generateInternalId();
        await pool.query(
          'INSERT INTO users (id, google_sub, email, name, picture, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [userId, googleSub, email, name, picture]
        );
      }

      const [pRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM practicals WHERE user_id = ?', [userId]);
      if (pRows && pRows[0]) {
        savedPracticalsCount = Number(pRows[0].cnt) || 0;
      }
    } catch (_dbErr) {
      // Fallback if MySQL database is not configured yet
      userId = `usr_${googleSub.substring(0, 16)}`;
    }

    const sessionData = JSON.stringify({
      userId,
      googleSub,
      email,
      name,
      picture,
      savedPracticalsCount,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    });
    const sessionToken = Buffer.from(sessionData).toString('base64');
    const isProd = process.env.NODE_ENV === 'production';
    const secureFlag = isProd ? 'Secure;' : '';

    res.setHeader(
      'Set-Cookie',
      `physics_session=${sessionToken}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax; ${secureFlag}`
    );

    res.status(200).json({
      success: true,
      user: {
        id: userId,
        google_sub: googleSub,
        email,
        name,
        picture,
        savedPracticalsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal authentication error', message: error?.message });
  }
});

// GET /api/auth/me
router.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  const session = parseSessionCookie(req.headers.cookie);
  if (!session) {
    res.status(200).json({ authenticated: false, user: null });
    return;
  }

  res.status(200).json({
    authenticated: true,
    user: session,
  });
});

// POST /api/auth/logout
router.post('/auth/logout', (_req: AuthenticatedRequest, res: Response) => {
  res.setHeader(
    'Set-Cookie',
    'physics_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;'
  );
  res.status(200).json({ success: true });
});

export default router;
