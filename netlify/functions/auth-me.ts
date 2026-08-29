import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    // Parse cookies from headers
    const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, v.join("=")];
      })
    );

    const sessionCookie = cookies["physics_session"];

    if (!sessionCookie) {
      return {
        statusCode: 401,
        body: JSON.stringify({ authenticated: false, user: null }),
        headers: { "Content-Type": "application/json" }
      };
    }

    // Decode session payload
    const sessionJson = Buffer.from(sessionCookie, "base64").toString("utf-8");
    const session = JSON.parse(sessionJson);

    // Verify expiry
    if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) {
      return {
        statusCode: 401,
        body: JSON.stringify({ authenticated: false, user: null, error: "Session expired" }),
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "physics_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax;"
        }
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
          createdAt: session.createdAt,
          lastLoginAt: session.lastLoginAt,
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
