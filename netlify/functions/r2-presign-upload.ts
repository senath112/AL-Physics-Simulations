import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { getAuthenticatedUser } from "./utils/session";
import { createPresignedPutUrl } from "./services/r2Service";

export const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  // 1. Authenticate user from session (NEVER trust client-supplied userId)
  const sessionUser = getAuthenticatedUser(event);
  if (!sessionUser) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Authentication required to generate upload URLs" }),
      headers: { "Content-Type": "application/json" }
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const { labId, fileName, contentType, contentLength, category } = body;

    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: fileName and contentType are mandatory." }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const result = await createPresignedPutUrl({
      userId: sessionUser.userId,
      labId: labId || "general",
      category: category || "images",
      fileName,
      contentType,
      contentLength: contentLength ? Number(contentLength) : undefined,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        uploadUrl: result.uploadUrl,
        key: result.key,
        expiresIn: result.expiresIn,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: err?.message || "Failed to generate upload URL" }),
    };
  }
};
