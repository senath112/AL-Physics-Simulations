import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand, 
  ListObjectsV2Command 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Allowed MIME types for Laboratory binary files
export const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "application/pdf",
  "text/csv",
  "application/json",
]);

// 10 MB maximum upload size for binary laboratory assets
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Default presigned URL lifetime (10 minutes)
export const DEFAULT_PRESIGNED_EXPIRY_SECONDS = 600;

/**
 * Returns a configured S3 client for Cloudflare R2 using server-side environment variables.
 */
export function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint = process.env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined);
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const region = process.env.R2_REGION || "auto";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Cloudflare R2 credentials are missing in server environment. " +
      "Ensure R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY are set."
    );
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * Constructs a strict, scoped R2 object key for a laboratory asset.
 * Format: users/{internalUserId}/lab/{laboratoryWorkId}/{category}/{fileName}
 */
export function constructObjectKey(
  userId: string,
  labId: string,
  category: string,
  fileName: string
): string {
  // Sanitize path parameters to prevent directory traversal
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeLabId = (labId || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeCategory = (category || "attachments").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFileName = fileName
    .replace(/^.*[\\\/]/, "") // remove path prefixes
    .replace(/[^a-zA-Z0-9_.-]/g, "_"); // sanitize invalid characters

  const uniquePrefix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return `users/${safeUserId}/lab/${safeLabId}/${safeCategory}/${uniquePrefix}_${safeFileName}`;
}

/**
 * Strictly verifies that the authenticated user owns the object key.
 * Throws an error if a user attempts to access an object belonging to another user.
 */
export function validateObjectOwnership(userId: string, key: string): void {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const requiredPrefix = `users/${safeUserId}/`;

  if (!key || !key.startsWith(requiredPrefix)) {
    throw new Error("Access Denied: User is not authorized to access or modify this object.");
  }
}

/**
 * Creates a short-lived presigned PUT URL allowing the client to upload directly to R2.
 */
export async function createPresignedPutUrl(params: {
  userId: string;
  labId: string;
  category?: string;
  fileName: string;
  contentType: string;
  contentLength?: number;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
  const {
    userId,
    labId,
    category = "images",
    fileName,
    contentType,
    contentLength,
    expiresInSeconds = DEFAULT_PRESIGNED_EXPIRY_SECONDS,
  } = params;

  // 1. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.has(contentType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${contentType}. Allowed formats: PNG, JPEG, WEBP, SVG, GIF, PDF, CSV, JSON.`
    );
  }

  // 2. Validate File Size if provided
  if (contentLength !== undefined && contentLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds limit. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
    );
  }

  // 3. Construct Scoped Key
  const key = constructObjectKey(userId, labId, category, fileName);
  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return { uploadUrl, key, expiresIn: expiresInSeconds };
}

/**
 * Creates a short-lived presigned GET URL allowing the client to read a private R2 object.
 */
export async function createPresignedGetUrl(params: {
  userId: string;
  key: string;
  expiresInSeconds?: number;
}): Promise<{ downloadUrl: string; key: string; expiresIn: number }> {
  const { userId, key, expiresInSeconds = DEFAULT_PRESIGNED_EXPIRY_SECONDS } = params;

  // Verify ownership before issuing download token
  validateObjectOwnership(userId, key);

  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";
  const client = getR2Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: expiresInSeconds,
  });

  return { downloadUrl, key, expiresIn: expiresInSeconds };
}

/**
 * Deletes a private R2 object after verifying user ownership.
 */
export async function deleteObject(params: {
  userId: string;
  key: string;
}): Promise<{ success: boolean; key: string }> {
  const { userId, key } = params;

  validateObjectOwnership(userId, key);

  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";
  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);

  return { success: true, key };
}

/**
 * Retrieves metadata for a private R2 object after verifying ownership.
 */
export async function getObjectMetadata(params: {
  userId: string;
  key: string;
}): Promise<{
  key: string;
  contentLength?: number;
  contentType?: string;
  lastModified?: Date;
  etag?: string;
}> {
  const { userId, key } = params;

  validateObjectOwnership(userId, key);

  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";
  const client = getR2Client();

  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const res = await client.send(command);

  return {
    key,
    contentLength: res.ContentLength,
    contentType: res.ContentType,
    lastModified: res.LastModified,
    etag: res.ETag,
  };
}

/**
 * Lists objects belonging to the authenticated user within a laboratory work scope.
 */
export async function listUserObjects(params: {
  userId: string;
  labId?: string;
}): Promise<Array<{ key: string; size?: number; lastModified?: Date }>> {
  const { userId, labId } = params;
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const prefix = labId
    ? `users/${safeUserId}/lab/${labId.replace(/[^a-zA-Z0-9_-]/g, "")}/`
    : `users/${safeUserId}/lab/`;

  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";
  const client = getR2Client();

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: 50,
  });

  const res = await client.send(command);

  return (res.Contents || []).map((item) => ({
    key: item.Key || "",
    size: item.Size,
    lastModified: item.LastModified,
  }));
}

/**
 * Server-side direct upload helper (used for automated tests / backend batch operations).
 */
export async function uploadObject(params: {
  key: string;
  body: Uint8Array | Buffer | string;
  contentType: string;
}): Promise<{ success: boolean; key: string }> {
  const { key, body, contentType } = params;
  const bucket = process.env.R2_BUCKET_NAME || "physicsbysenath-lab";
  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);
  return { success: true, key };
}
