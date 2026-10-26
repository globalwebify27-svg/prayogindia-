// src/app/api/about-showcase/upload/route.ts

import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import path from "path";
import fs from "fs/promises";
import { getSecurityHeaders } from "@/lib/security";

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const formData = await request.formData();
    const file = (formData.get("file") || formData.get("image")) as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No image file provided." },
        { status: 400, headers },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase() || ".jpg";
    const cleanName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const filename = `showcase_${cleanName}_${Date.now()}${extension}`;

    let finalUrl = "";
    let provider = "local";

    // 1. Attempt Cloudinary upload
    try {
      const uploadRes = await uploadToCloudinary(buffer, {
        folder: "about-showcase",
        publicId: `about-showcase/${cleanName}_${Date.now()}`,
        resourceType: "image",
      });
      if (uploadRes?.secure_url) {
        finalUrl = uploadRes.secure_url;
        provider = "cloudinary";
      }
    } catch (cErr) {
      console.warn("Cloudinary upload fallback to local disk:", cErr);
    }

    // 2. Fallback to local disk storage
    if (!finalUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "about");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      finalUrl = `/uploads/about/${filename}`;
      provider = "local";
    }

    return NextResponse.json(
      {
        success: true,
        url: finalUrl,
        filename,
        originalName,
        format: extension.replace(".", ""),
        size: buffer.length,
        provider,
      },
      { status: 200, headers },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to upload image.";
    console.error("About showcase upload error:", err);
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers },
    );
  }
}
