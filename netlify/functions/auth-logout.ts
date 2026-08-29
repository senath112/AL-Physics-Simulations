import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  // Clear the HttpOnly session cookie
  const isProd = process.env.NODE_ENV === "production" || process.env.CONTEXT === "production";
  const secureFlag = isProd ? "Secure;" : "";
  const clearCookieHeader = `physics_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; ${secureFlag}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookieHeader
    },
    body: JSON.stringify({ success: true, message: "Logged out successfully" })
  };
};
