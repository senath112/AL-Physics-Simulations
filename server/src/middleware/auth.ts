import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthenticatedUserSession {
  userId: string;
  googleSub: string;
  email: string;
  name: string;
  picture?: string;
  savedPracticalsCount?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserSession;
}

/**
 * Session signing secret. In production, SESSION_SECRET must be set.
 * Falls back to a per-process random key in development (sessions won't survive restarts).
 */
const SESSION_SECRET: string =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? (() => { console.error('[SECURITY] SESSION_SECRET is not set in production! Generating ephemeral key.'); return crypto.randomBytes(32).toString('hex'); })()
    : crypto.randomBytes(32).toString('hex'));

/**
 * Sign a session payload with HMAC-SHA256.
 * Returns: `base64url(payload).base64url(signature)`
 */
export function signSession(payload: object): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode a signed session token.
 * Returns null if signature is invalid, tampered, or malformed.
 */
export function verifySession(token: string): Record<string, any> | null {
  if (!token || typeof token !== 'string') return null;

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return null;

  const payloadB64 = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  // Timing-safe comparison prevents timing side-channel attacks
  try {
    const sigBuf = Buffer.from(signature, 'utf-8');
    const expectedBuf = Buffer.from(expectedSig, 'utf-8');
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export function parseSessionCookie(cookieHeader?: string): AuthenticatedUserSession | null {
  if (!cookieHeader) return null;
  try {
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const sessionCookie = cookies["physics_session"];
    if (!sessionCookie) return null;

    // Verify HMAC signature before trusting payload
    const session = verifySession(sessionCookie);
    if (!session) return null;

    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (!session.userId) return null;

    return {
      userId: session.userId,
      googleSub: session.googleSub,
      email: session.email || "",
      name: session.name || "Physics Student",
      picture: session.picture,
      savedPracticalsCount: session.savedPracticalsCount || 0,
    };
  } catch (_err) {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const session = parseSessionCookie(req.headers.cookie);
  if (session) {
    req.user = session;
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const session = parseSessionCookie(req.headers.cookie);
  if (!session) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  req.user = session;
  next();
}
