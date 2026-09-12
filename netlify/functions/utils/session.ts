import type { HandlerEvent } from "@netlify/functions";
import crypto from "crypto";

export interface AuthenticatedUserSession {
  userId: string;
  googleSub: string;
  email: string;
  name: string;
  picture?: string;
  createdAt?: string;
  lastLoginAt?: string;
  savedPracticalsCount?: number;
}

const SESSION_SECRET: string =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production" || process.env.CONTEXT === "production"
    ? (() => {
        console.error(
          "[SECURITY WARNING] SESSION_SECRET is missing in production. Using ephemeral secret for this runtime."
        );
        return crypto.randomBytes(32).toString("hex");
      })()
    : crypto.randomBytes(32).toString("hex"));

export function signSessionToken(payload: object): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${signature}`;
}

function verifySessionToken(token: string): Record<string, any> | null {
  if (!token || typeof token !== "string") return null;

  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;

  const payloadB64 = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);
  if (!payloadB64 || !signature) return null;

  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  try {
    const sigBuf = Buffer.from(signature, "utf-8");
    const expectedBuf = Buffer.from(expectedSig, "utf-8");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

/**
 * Extracts and validates the authenticated user session from request cookies or headers.
 * NEVER trusts client-supplied user IDs in query parameters or request bodies.
 */
export function getAuthenticatedUser(event: HandlerEvent): AuthenticatedUserSession | null {
  try {
    const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const sessionCookie = cookies["physics_session"];
    if (!sessionCookie) {
      return null;
    }

    const session = verifySessionToken(sessionCookie);
    if (!session) return null;

    // Check expiration
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    if (!session.userId) {
      return null;
    }

    return {
      userId: session.userId,
      googleSub: session.googleSub,
      email: session.email || "",
      name: session.name || "Physics Student",
      picture: session.picture,
      createdAt: session.createdAt,
      lastLoginAt: session.lastLoginAt,
      savedPracticalsCount: session.savedPracticalsCount || 0,
    };
  } catch (_err) {
    return null;
  }
}
