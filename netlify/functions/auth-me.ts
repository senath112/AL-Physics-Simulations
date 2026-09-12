import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { getAuthenticatedUser } from "./utils/session";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const session = getAuthenticatedUser(event);
    if (!session) {
      return {
        statusCode: 401,
        body: JSON.stringify({ authenticated: false, user: null }),
        headers: { "Content-Type": "application/json" }
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authenticated: true,
        user: {
          id: session.userId,
          google_sub: session.googleSub,
          email: session.email,
          name: session.name,
          picture: session.picture,
          createdAt: session.createdAt || new Date().toISOString(),
          lastLoginAt: session.lastLoginAt || new Date().toISOString(),
          savedPracticalsCount: session.savedPracticalsCount || 0
        }
      })
    };
  } catch (err: any) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authenticated: false, user: null, error: "Invalid session" })
    };
  }
};
