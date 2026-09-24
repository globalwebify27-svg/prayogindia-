// src/lib/cloudinaryUrl.ts
// Pure client-safe URL formatter for Cloudinary media transformations.
// Does NOT import the server 'cloudinary' Node.js SDK (avoids Node 'fs'/'child_process' browser bundling errors).

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "fyueflvh";

export interface OptimizeImageOptions {
  width?: number;
  height?: number;
  quality?: string | number; // 'auto', 'auto:good', 'auto:eco', or 1-100
  format?: string; // 'webp' (default), 'avif', 'auto'
  crop?: string; // 'limit', 'fill', 'scale'
}

export interface OptimizeVideoOptions {
  width?: number;
  quality?: string | number; // 'auto', 'auto:eco'
  format?: string; // 'webm' (default), 'mp4', 'auto'
}

/**
 * Generates an optimized Cloudinary delivery URL for images in WebP format.
 * Converts any image into lightweight WebP format with automated compression (f_webp, q_auto).
 */
export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options: OptimizeImageOptions = {},
): string {
  if (!publicIdOrUrl) return "/placeholder-product.png";

  const {
    width,
    height,
    quality = "auto",
    format = "webp",
    crop = "limit",
  } = options;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    width || height ? `c_${crop}` : null,
  ]
    .filter(Boolean)
    .join(",");

  if (
    publicIdOrUrl.startsWith("http://") ||
    publicIdOrUrl.startsWith("https://")
  ) {
    if (
      publicIdOrUrl.includes("res.cloudinary.com") &&
      publicIdOrUrl.includes("/upload/")
    ) {
      const parts = publicIdOrUrl.split("/upload/");
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  // Clean publicId
  const cleanId = publicIdOrUrl.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${cleanId}`;
}

/**
 * Generates an optimized Cloudinary delivery URL for videos.
 * Transcodes video to modern WebM / VP9 or animated WebP with adaptive compression.
 */
export function getOptimizedVideoUrl(
  publicIdOrUrl: string,
  options: OptimizeVideoOptions = {},
): string {
  if (!publicIdOrUrl) return "";

  const { width, quality = "auto", format = "webm" } = options;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    width ? `w_${width}` : null,
    "vc_auto",
  ]
    .filter(Boolean)
    .join(",");

  if (
    publicIdOrUrl.startsWith("http://") ||
    publicIdOrUrl.startsWith("https://")
  ) {
    if (
      publicIdOrUrl.includes("res.cloudinary.com") &&
      publicIdOrUrl.includes("/upload/")
    ) {
      const parts = publicIdOrUrl.split("/upload/");
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  const cleanId = publicIdOrUrl.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformations}/${cleanId}`;
}

/**
 * Converts a video clip or loop into an animated WebP file (lightweight alternative to GIF / MP4).
 */
export function getAnimatedWebpUrl(
  publicIdOrUrl: string,
  options: { width?: number; fps?: number } = {},
): string {
  if (!publicIdOrUrl) return "";

  const { width, fps = 24 } = options;
  const transformations = [
    "f_webp",
    "fl_awebp",
    `fps_${fps}`,
    width ? `w_${width}` : null,
  ]
    .filter(Boolean)
    .join(",");

  if (
    publicIdOrUrl.startsWith("http://") ||
    publicIdOrUrl.startsWith("https://")
  ) {
    if (
      publicIdOrUrl.includes("res.cloudinary.com") &&
      publicIdOrUrl.includes("/upload/")
    ) {
      const parts = publicIdOrUrl.split("/upload/");
      return `${parts[0]}/upload/${transformations}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  const cleanId = publicIdOrUrl.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/${transformations}/${cleanId}`;
}
