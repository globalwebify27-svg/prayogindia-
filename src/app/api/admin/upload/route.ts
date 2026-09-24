// src/app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { uploadToCloudinary } from "@/lib/cloudinary";

// POST /api/admin/upload - Multi-file direct upload for Images & Videos to Cloudinary
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
    const files = formData.getAll("files") as File[];
    const folder = (formData.get("folder") as string) || "products";

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
      const resourceType = isVideo ? "video" : "image";

      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const publicId = `${folder}/${cleanName}_${Date.now()}`;

      const uploadRes = await uploadToCloudinary(buffer, {
        folder,
        publicId,
        resourceType,
      });

      uploadedResults.push({
        name: file.name,
        type: resourceType,
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
        bytes: uploadRes.bytes,
        originalBytes: uploadRes.original_bytes || buffer.length,
        savingsPercentage: uploadRes.savings_percentage || 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully compressed and uploaded ${uploadedResults.length} asset(s) to Cloudinary CDN.`,
      data: uploadedResults,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to upload media.";
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}
