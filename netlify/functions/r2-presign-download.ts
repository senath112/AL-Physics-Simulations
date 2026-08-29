import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { getAuthenticatedUser } from "./utils/session";
import { createPresignedGetUrl } from "./services/r2Service";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
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
      body: JSON.stringify({ error: "Authentication required to generate download URLs" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { key, expiresInSeconds } = body;

    if (!key || typeof key !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required field: key is mandatory." }),
        headers: { "Content-Type": "application/json" }
      };
    }

    // 2. Verified ownership inside createPresignedGetUrl
    const result = await createPresignedGetUrl({
      userId: sessionUser.userId,
      key,
      expiresInSeconds: expiresInSeconds ? Number(expiresInSeconds) : undefined,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        downloadUrl: result.downloadUrl,
        key: result.key,
        expiresIn: result.expiresIn,
      }),
    };
  } catch (err: any) {
    const isForbidden = err?.message?.includes("Access Denied");
    return {
      statusCode: isForbidden ? 403 : 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err?.message || "Failed to generate download URL" }),
    };
  }
};
