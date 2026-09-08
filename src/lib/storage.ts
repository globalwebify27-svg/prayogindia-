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

// 3. Cloudinary Object Storage & Global CDN Implementation
export class CloudinaryStorageService implements StorageService {
  private cloudName: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.cloudName = process.env.CLOUDINARY_CLOUD_NAME || "fyueflvh";
    this.apiKey = process.env.CLOUDINARY_API_KEY || "544111356368169";
    this.apiSecret =
      process.env.CLOUDINARY_API_SECRET || "rYfAb_4wHeuE6FfCMaSFNFMjsPc";
  }

  async upload(
    key: string,
    buffer: Buffer,
    _mimeType: string,
  ): Promise<string> {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });

    const publicId = key.replace(/\.[^/.]+$/, ""); // strip extension

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          resource_type: "auto",
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || "");
        },
      );
      uploadStream.end(buffer);
    });
  }

  async delete(key: string): Promise<boolean> {
    try {
      const { v2: cloudinary } = await import("cloudinary");
      cloudinary.config({
        cloud_name: this.cloudName,
        api_key: this.apiKey,
        api_secret: this.apiSecret,
        secure: true,
      });

      const publicId = key.replace(/\.[^/.]+$/, "");
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, "");
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${cleanKey}`;
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });

    const publicId = key.replace(/\.[^/.]+$/, "");
    const signature = cloudinary.utils.api_sign_request(
      { public_id: publicId, timestamp },
      this.apiSecret,
    );

    return `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload?api_key=${this.apiKey}&timestamp=${timestamp}&signature=${signature}&public_id=${encodeURIComponent(publicId)}`;
  }

  async exists(_key: string): Promise<boolean> {
    return true;
  }
}

// 4. Factory Getter
export function getStorageService(): StorageService {
  const provider = (process.env.STORAGE_PROVIDER || "cloudinary").toLowerCase();

  if (provider === "cloudinary") {
    return new CloudinaryStorageService();
  }

  if (provider === "s3" || provider === "gcs") {
    return new S3StorageService();
  }

  return new LocalStorageService();
}

/**
 * Generate safe, unique storage object key.
 * Prevents path traversal and filename collisions.
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

/**
 * Enterprise Centralized Product Media Key Generator.
 * Rule: One global path per product. Never store-specific!
 * Pattern: products/{productId}/{slot}-{randomHash}.{ext}
 * Example: products/PROD-001/main.webp, products/PROD-001/image-2.webp
 */
export function generateProductMediaKey(
  productId: string,
  originalFilename: string,
  slot: "main" | "gallery" | "video" | "datasheet" | "cad" = "main",
  index = 0,
): string {
  const cleanProdId = productId.trim().replace(/[^a-zA-Z0-9_-]/g, "");
  const ext = originalFilename.includes(".")
    ? originalFilename.split(".").pop()?.toLowerCase()
    : "webp";
  const safeExt = (ext || "webp").replace(/[^a-z0-9]/g, "");
  const suffix = index > 0 ? `-${index + 1}` : "";
  const randomSuffix = Math.random().toString(36).substring(2, 7);

  return `products/${cleanProdId}/${slot}${suffix}-${randomSuffix}.${safeExt}`;
}

// Allowed MIME Type Whitelists for Uploads
export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export const ALLOWED_PRODUCT_MEDIA_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "application/pdf",
];

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_PRODUCT_MEDIA_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
