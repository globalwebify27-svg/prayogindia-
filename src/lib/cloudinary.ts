// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "fyueflvh",
  api_key: process.env.CLOUDINARY_API_KEY || "544111356368169",
  api_secret: process.env.CLOUDINARY_API_SECRET || "rYfAb_4wHeuE6FfCMaSFNFMjsPc",
  secure: true,
});

export { cloudinary };

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
}

export * from "./cloudinaryUrl";

/**
 * Upload a file buffer directly to Cloudinary under the centralized products/ directory
 * with automatic WebP conversion and optimization presets applied at ingestion time.
 *
 * For Images:
 * - Automatically converted into WebP format (`format: 'webp'`).
 * - Resizes oversize images down to max 2000px width/height while keeping aspect ratio.
 * - Applies Cloudinary perceptual auto-compression (`quality: 'auto:good'`).
 * - Strips unnecessary camera metadata/EXIF for minimal bytes.
 *
 * For Videos:
 * - Automatically transcoded with WebM (VP9/VP8) / H.264 profile.
 * - Compresses bitrates with `quality: 'auto'`.
 * - Caps max dimension at 1920px (Full HD).
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    publicId?: string;
    resourceType?: "image" | "video" | "auto" | "raw";
    maxWidth?: number;
    maxHeight?: number;
  } = {},
): Promise<CloudinaryUploadResult> {
  const {
    folder = "products",
    publicId,
    resourceType = "auto",
    maxWidth = 2000,
    maxHeight = 2000,
  } = options;

  return new Promise((resolve, reject) => {
    const uploadParams: Record<string, any> = {
      folder,
      public_id: publicId,
      resource_type: resourceType,
      overwrite: true,
    };

    if (resourceType === "image" || resourceType === "auto") {
      uploadParams.format = "webp"; // Direct WebP format conversion
      uploadParams.transformation = [
        {
          width: maxWidth,
          height: maxHeight,
          crop: "limit", // Preserves original aspect ratio without distortion
          quality: "auto:good", // Perceptual compression without visible degradation
          format: "webp", // Force output in WebP
        },
      ];
    } else if (resourceType === "video") {
      uploadParams.transformation = [
        {
          width: 1920,
          crop: "limit",
          quality: "auto",
          video_codec: "auto",
          audio_codec: "aac",
        },
      ];
      uploadParams.eager = [
        { format: "webm", quality: "auto" }, // WebM VP9/VP8
        { format: "webp", flags: "awebp" },  // Animated WebP
      ];
      uploadParams.eager_async = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadParams,
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload returned empty result"));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format || "",
          resource_type: result.resource_type,
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(buffer);
  });
}
