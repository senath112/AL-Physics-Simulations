import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// In-memory / persistent user store simulation for serverless execution
// In production, connect this to your primary database (e.g., Supabase, Neon, PostgreSQL, or Cloudflare KV/D1)
interface StoredUser {
  id: string;
  google_sub: string;
  email: string;
  name: string;
  picture: string;
  createdAt: string;
  lastLoginAt: string;
  savedPracticalsCount: number;
}

// Global store across warm container invocations
const globalUsers = new Map<string, StoredUser>();

function generateInternalId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "usr_";
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing or invalid Google ID token" }),
        headers: { "Content-Type": "application/json" }
      };
    }

    // Cryptographically verify Google ID token with Google OAuth Tokeninfo API
    const googleVerifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
    const verifyRes = await fetch(googleVerifyUrl);

    if (!verifyRes.ok) {
      const errData = await verifyRes.json().catch(() => ({}));
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid Google ID token signature or expired token", details: errData }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const payload = await verifyRes.json();

    // Verify token claims (issuer, audience, expiration)
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (!validIssuers.includes(payload.iss)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid token issuer" }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const expectedClientId =
      process.env.GOOGLE_CLIENT_ID ||
      process.env.VITE_GOOGLE_CLIENT_ID ||
      "390586089507-smgotc9kctkdhl201j9bjon149earu5j.apps.googleusercontent.com";
    if (expectedClientId && payload.aud !== expectedClientId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Token audience does not match configured Google Client ID" }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const googleSub = payload.sub;
    const email = payload.email || "";
    const name = payload.name || "Physics Student";
    const picture = payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff`;

    // Find existing user by google_sub or create new internal record
    let user = globalUsers.get(googleSub);
    const now = new Date().toISOString();

    if (user) {
      // Existing user: update last login and profile info
      user.name = name;
      user.picture = picture;
      user.lastLoginAt = now;
      globalUsers.set(googleSub, user);
    } else {
      // New user: create internal Physics by Senath user ID (usr_...)
      user = {
        id: generateInternalId(),
        google_sub: googleSub,
        email,
        name,
        picture,
        createdAt: now,
        lastLoginAt: now,
        savedPracticalsCount: 0
      };
      globalUsers.set(googleSub, user);
    }

    // Create a base64 session payload (or JWT session in production)
    const sessionData = JSON.stringify({
      userId: user.id,
      googleSub: user.google_sub,
      email: user.email,
      name: user.name,
      picture: user.picture,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      savedPracticalsCount: user.savedPracticalsCount,
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days
    });
    const sessionToken = Buffer.from(sessionData).toString("base64");

    // Secure HttpOnly session cookie
    const isProd = process.env.NODE_ENV === "production" || process.env.CONTEXT === "production";
    const secureFlag = isProd ? "Secure;" : "";
    const cookieHeader = `physics_session=${sessionToken}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax; ${secureFlag}`;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader
      },
      body: JSON.stringify({
        success: true,
        user: {
          id: user.id,
          google_sub: user.google_sub,
          email: user.email,
          name: user.name,
          picture: user.picture,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          savedPracticalsCount: user.savedPracticalsCount
        }
      })
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal authentication error", message: error?.message }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
