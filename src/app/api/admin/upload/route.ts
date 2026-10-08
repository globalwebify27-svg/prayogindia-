// src/app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { compressImageBuffer } from "@/lib/mediaCompressor";
import path from "path";
import fs from "fs/promises";

// POST /api/admin/upload - Multi-file & Single-file upload with auto WebP/AVIF compression
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Forbidden. Admin authentication required." },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    // Support both 'file', 'files', and 'image' form fields
    const singleFile = (formData.get("file") || formData.get("image")) as File | null;
    let files = formData.getAll("files") as File[];
    if ((!files || files.length === 0) && singleFile) {
      files = [singleFile];
    }

    const folder = (formData.get("folder") as string) || "products";
    const targetFormat = ((formData.get("format") as string) || "webp").toLowerCase() as
      | "webp"
      | "avif"
      | "jpeg"
      | "png";

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "No files provided for upload." },
        { status: 400 },
      );
    }

    const uploadedResults = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      const resourceType = isVideo ? "video" : "image";

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .toLowerCase();
      const filename = `${cleanName}_${Date.now()}.${isImage ? targetFormat : "mp4"}`;
      const publicId = `${folder}/${cleanName}_${Date.now()}`;

      let finalUrl = "";
      let compressedBytes = buffer.length;
      let savingsPercentage = 0;

      // 1. Image Compression using Sharp (WebP / AVIF)
      let uploadBuffer = buffer;
      if (isImage) {
        try {
          const compResult = await compressImageBuffer(buffer, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 82,
            format: targetFormat,
          });
          uploadBuffer = Buffer.from(compResult.buffer);
          compressedBytes = compResult.compressedBytes;
          savingsPercentage = compResult.savingsPercentage;
        } catch (err) {
          console.warn("[Upload] Sharp compression fallback:", err);
        }
      }

      // 2. Attempt Cloudinary upload first
      let cloudinarySuccess = false;
      try {
        if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          const uploadRes = await uploadToCloudinary(uploadBuffer, {
            folder,
            publicId,
            resourceType,
          });
          if (uploadRes?.secure_url) {
            finalUrl = uploadRes.secure_url;
            cloudinarySuccess = true;
          }
        }
      } catch {
        cloudinarySuccess = false;
      }

      // 3. Fallback to local public/uploads directory
      if (!cloudinarySuccess) {
        try {
          const uploadDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, filename);
          await fs.writeFile(filePath, uploadBuffer);
          finalUrl = `/uploads/${filename}`;
        } catch (writeErr: any) {
          console.error("[Upload] Local disk write error:", writeErr);
          throw new Error(`Failed to store image: ${writeErr.message}`);
        }
      }

      uploadedResults.push({
        name: file.name,
        filename,
        type: resourceType,
        format: isImage ? targetFormat : "mp4",
        url: finalUrl,
        bytes: compressedBytes,
        originalBytes: buffer.length,
        savingsPercentage,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully converted and compressed ${uploadedResults.length} file(s) into ${targetFormat.toUpperCase()}.`,
      data: uploadedResults.length === 1 ? uploadedResults[0] : uploadedResults,
      items: uploadedResults,
    });
  } catch (error: unknown) {
    console.error("[Upload API] Error:", error);
    const msg =
      error instanceof Error ? error.message : "Failed to upload media.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
