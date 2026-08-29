import type { HandlerEvent } from "@netlify/functions";

export interface AuthenticatedUserSession {
  userId: string;
  googleSub: string;
  email: string;
  name: string;
  picture?: string;
  savedPracticalsCount?: number;
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

    const sessionJson = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const session = JSON.parse(sessionJson);

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
      savedPracticalsCount: session.savedPracticalsCount || 0,
    };
  } catch (_err) {
    return null;
  }
}
