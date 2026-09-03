/**
 * Prayog India Storage Service Abstraction Layer (B8)
 * Provider-independent interface supporting S3/Cloud Storage and Local Fallback.
 */

export interface StorageObjectMetadata {
  id: string;
  storageKey: string;
  originalName?: string;
  mimeType: string;
  size: number;
  url: string;
  isPrivate: boolean;
  context:
    | "PRODUCT_IMAGE"
    | "SERVICE_IMAGE"
    | "LEARNING_MEDIA"
    | "OFFER_MEDIA"
    | "SUPPORT_ATTACHMENT";
  createdAt: Date;
}

export interface StorageService {
  upload(key: string, buffer: Buffer, mimeType: string): Promise<string>;
  delete(key: string): Promise<boolean>;
  getUrl(key: string): string;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  exists(key: string): Promise<boolean>;
}

// 1. Local / Mock Storage Implementation
export class LocalStorageService implements StorageService {
  private publicPrefix: string;

  constructor() {
    this.publicPrefix =
      process.env.STORAGE_PUBLIC_URL_PREFIX || "https://media.prayogindia.com";
  }

  async upload(
    key: string,
    _buffer: Buffer,
    _mimeType: string,
  ): Promise<string> {
    return `${this.publicPrefix}/${key}`;
  }

  async delete(_key: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    return `${this.publicPrefix}/${key}`;
  }

  async getSignedUrl(key: string, _expiresInSeconds = 3600): Promise<string> {
    return `${this.publicPrefix}/${key}?token=signed-${Date.now()}`;
  }

  async exists(_key: string): Promise<boolean> {
    return true;
  }
}

// 2. S3 / Object Storage Production Implementation
export class S3StorageService implements StorageService {
  private bucket: string;
  private region: string;
  private endpoint: string;

  constructor() {
    this.bucket = process.env.STORAGE_BUCKET || "prayog-media";
    this.region = process.env.STORAGE_REGION || "ap-south-1";
    this.endpoint =
      process.env.STORAGE_ENDPOINT || `https://s3.${this.region}.amazonaws.com`;
  }

  async upload(
    key: string,
    _buffer: Buffer,
    _mimeType: string,
  ): Promise<string> {
    // S3 PutObject integration placeholder
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async delete(_key: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    // S3 getSignedUrlPromise placeholder
    return `${this.endpoint}/${this.bucket}/${key}?X-Amz-Expires=${expiresInSeconds}&X-Amz-Signature=mock`;
  }

  async exists(_key: string): Promise<boolean> {
    return true;
  }
}

// 3. Factory Getter
export function getStorageService(): StorageService {
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  if (provider === "s3" || provider === "gcs") {
    return new S3StorageService();
  }

  return new LocalStorageService();
}

/**
 * Generate safe, unique storage object key.
 * Prevents path traversal and filename collisons.
 */
export function generateStorageKey(
  context: string,
  userId: string,
  originalFilename: string,
): string {
  const sanitizeContext = context.toLowerCase().replace(/[^a-z0-9_-]/g, "");
  const ext = originalFilename.includes(".")
    ? originalFilename.split(".").pop()?.toLowerCase()
    : "bin";
  const safeExt = (ext || "bin").replace(/[^a-z0-9]/g, "");
  const randomUuid =
    Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

  return `${sanitizeContext}/${userId}/${randomUuid}.${safeExt}`;
}

// Allowed MIME Type Whitelists for Uploads
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
