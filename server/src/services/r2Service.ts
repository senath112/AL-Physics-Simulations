import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  HeadObjectCommand, 
  ListObjectsV2Command 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const DEFAULT_PRESIGNED_EXPIRY_SECONDS = 600;

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

export function constructObjectKey(
  userId: string,
  labId: string,
  category: string,
  fileName: string
): string {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeLabId = (labId || "general").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeCategory = (category || "attachments").replace(/[^a-zA-Z0-9_-]/g, "");
  const safeFileName = fileName
    .replace(/^.*[\\\/]/, "")
    .replace(/[^a-zA-Z0-9_.-]/g, "_");

  const uniquePrefix = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return `users/${safeUserId}/lab/${safeLabId}/${safeCategory}/${uniquePrefix}_${safeFileName}`;
}

export function validateObjectOwnership(userId: string, key: string): void {
  const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const requiredPrefix = `users/${safeUserId}/`;

  if (!key || !key.startsWith(requiredPrefix)) {
    throw new Error("Access Denied: User is not authorized to access or modify this object.");
  }
}

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

  if (!ALLOWED_MIME_TYPES.has(contentType.toLowerCase())) {
    throw new Error(
      `Unsupported file type: ${contentType}. Allowed formats: PNG, JPEG, WEBP, SVG, GIF, PDF, CSV, JSON.`
    );
  }

  if (contentLength !== undefined && contentLength > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds limit. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`
    );
  }

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

export async function createPresignedGetUrl(params: {
  userId: string;
  key: string;
  expiresInSeconds?: number;
}): Promise<{ downloadUrl: string; key: string; expiresIn: number }> {
  const { userId, key, expiresInSeconds = DEFAULT_PRESIGNED_EXPIRY_SECONDS } = params;

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
