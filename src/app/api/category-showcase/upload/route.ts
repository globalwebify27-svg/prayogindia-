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
        { success: false, message: "No image file provided for upload." },
        { status: 400, headers }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name;
    const extension = path.extname(originalName).toLowerCase() || ".png";
    const cleanName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();
    const filename = `${cleanName}_${Date.now()}${extension}`;

    let finalUrl = "";
    let provider = "local";

    // 1. Attempt Cloudinary upload
    try {
      const uploadRes = await uploadToCloudinary(buffer, {
        folder: "category_cutouts",
        publicId: `category_cutouts/${cleanName}_${Date.now()}`,
        resourceType: "image",
      });
      if (uploadRes?.secure_url) {
        finalUrl = uploadRes.secure_url;
        provider = "cloudinary";
      }
    } catch (cErr) {
      console.warn("Cloudinary upload fallback to local storage:", cErr);
    }

    // 2. Fallback to local disk storage
    if (!finalUrl) {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "categories");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      finalUrl = `/uploads/categories/${filename}`;
      provider = "local";
    }

    return NextResponse.json(
      {
        success: true,
        url: finalUrl,
        provider,
        filename,
        originalName,
        format: extension.replace(".", ""),
        message: "Cutout image uploaded successfully.",
      },
      { headers }
    );
  } catch (error: any) {
    console.error("Category cutout upload error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to upload image." },
      { status: 500, headers }
    );
  }
}
