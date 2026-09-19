// src/lib/clientImageCompressor.ts

export interface ClientCompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  width: number;
  height: number;
  dataUrl?: string;
}

/**
 * Client-side Canvas Image Compression
 * Shrinks dimensions to max 1920px and converts to WebP/JPEG at high visual fidelity (quality 0.82)
 * Runs client-side before sending to server for lightning-fast uploads
 */
export async function compressImageOnClient(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    preferredMimeType?: "image/webp" | "image/jpeg";
  } = {},
): Promise<ClientCompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    preferredMimeType = "image/webp",
  } = options;

  // If not an image, return untouched
  if (!file.type.startsWith("image/")) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  // If SVG or small icon, don't recompress
  if (file.type === "image/svg+xml" || file.size < 20 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve) => {
    const originalSize = file.size;
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if oversized
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({
          file,
          originalSize,
          compressedSize: originalSize,
          savingsPercentage: 0,
          width: img.width,
          height: img.height,
        });
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Check format support (prefer webp)
      const targetMime = preferredMimeType;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savingsPercentage: 0,
              width,
              height,
            });
            return;
          }

          // If compression actually reduced size, use compressed blob
          if (blob.size < originalSize) {
            const ext = targetMime === "image/webp" ? ".webp" : ".jpg";
            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const compressedFile = new File([blob], `${baseName}${ext}`, {
              type: targetMime,
              lastModified: Date.now(),
            });

            const savings = Math.round(
              ((originalSize - blob.size) / originalSize) * 100,
            );

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: blob.size,
              savingsPercentage: Math.max(0, savings),
              width,
              height,
            });
          } else {
            // Keep original if canvas enlarged it
            resolve({
              file,
              originalSize,
              compressedSize: originalSize,
              savingsPercentage: 0,
              width,
              height,
            });
          }
        },
        targetMime,
        quality,
      );
    };

    img.onerror = () => {
      resolve({
        file,
        originalSize,
        compressedSize: originalSize,
        savingsPercentage: 0,
        width: 0,
        height: 0,
      });
    };

    reader.readAsDataURL(file);
  });
}
