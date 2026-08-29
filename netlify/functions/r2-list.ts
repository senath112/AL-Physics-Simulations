import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { getAuthenticatedUser } from "./utils/session";
import { listUserObjects } from "./services/r2Service";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  // 1. Authenticate user from session
  const sessionUser = getAuthenticatedUser(event);
  if (!sessionUser) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Authentication required to list laboratory assets" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const labId = event.queryStringParameters?.labId;

    const objects = await listUserObjects({
      userId: sessionUser.userId,
      labId,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        objects,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err?.message || "Failed to list objects" }),
    };
  }
};
