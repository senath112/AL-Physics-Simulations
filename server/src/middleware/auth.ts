import { Request, Response, NextFunction } from 'express';

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

    const sessionJson = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const session = JSON.parse(sessionJson);

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
