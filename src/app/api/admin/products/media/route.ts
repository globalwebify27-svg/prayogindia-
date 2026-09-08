import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthenticatedAdmin } from "@/lib/adminAuth";
import { getAuthenticatedStaff } from "@/lib/staffAuth";
import {
  generateProductMediaKey,
  getStorageService,
  ALLOWED_PRODUCT_MEDIA_TYPES,
  MAX_PRODUCT_MEDIA_SIZE_BYTES,
} from "@/lib/storage";

/**
 * Enterprise Centralized Product Media API
 * Architecture Rule:
 * - Product images must NOT be store-wise duplicated.
 * - Media belongs exclusively to the global Product (product_id).
 * - CDN/Object storage URL stored in DB metadata, binary in S3/R2.
 * - Immediate availability to Website, Mobile App, Ranchi POS, Patna POS, Delhi POS, etc.
 */

interface ProductMediaPayload {
  productId?: string;
  action?: "request_upload" | "save_media";
  filename?: string;
  mimeType?: string;
  size?: number;
  imageUrl?: string;
  altText?: string;
  sortOrder?: number;
  slot?: "main" | "gallery" | "video" | "datasheet" | "cad";
}

// GET /api/admin/products/media?productId=... or ?sku=...
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId")?.trim();
    const sku = searchParams.get("sku")?.trim();

    if (!productId && !sku) {
      return NextResponse.json(
        {
          success: false,
          message: "Either productId or sku parameter is required.",
        },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const product = await db.product.findFirst({
        where: productId ? { id: productId } : { sku },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });

      if (!product) {
        return NextResponse.json(
          { success: false, message: "Product not found in global catalog." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        architecture: "GLOBAL_PRODUCT_MEDIA",
        media: product.images.map((img, idx) => ({
          id: img.id,
          productId: img.productId,
          imageUrl: img.imageUrl,
          altText: img.altText || product.name,
          sortOrder: img.sortOrder,
          isPrimary: idx === 0,
        })),
      });
    }

    // Mock fallback
    return NextResponse.json({
      success: true,
      productId: productId || "PROD-001",
      sku: sku || "ARD-001",
      productName: "Arduino UNO R3",
      architecture: "GLOBAL_PRODUCT_MEDIA",
      media: [
        {
          id: "med-1",
          productId: productId || "PROD-001",
          imageUrl:
            "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800",
          altText: "Arduino UNO R3",
          sortOrder: 0,
          isPrimary: true,
        },
      ],
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error ? error.message : "Failed to fetch media.";
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500 },
    );
  }
}

// POST /api/admin/products/media
// Authorized Super Admin requests upload slot for global product or saves media link
export async function POST(request: Request) {
  const staff = (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  // Only SUPER_ADMIN is permitted to manage global product media catalog
  const isSuperAdmin =
    staff &&
    (staff.role === "SUPER_ADMIN" ||
      (staff.role as unknown as string) === "ADMIN");

  if (!isSuperAdmin) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Forbidden. Only Super Admin has authority to manage global product media.",
      },
      { status: 403 },
    );
  }

  try {
    const body: ProductMediaPayload = await request.json().catch(() => ({}));
    const {
      productId,
      action = "request_upload",
      filename,
      mimeType,
      size,
      imageUrl,
      altText,
      sortOrder = 0,
      slot = "gallery",
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "productId is required." },
        { status: 400 },
      );
    }

    // Verify global product exists
    let globalProductName: string | null = null;
    if (process.env.DATABASE_URL) {
      const globalProduct = await db.product.findUnique({
        where: { id: productId },
      });
      if (!globalProduct) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${productId} does not exist in global catalog.`,
          },
          { status: 404 },
        );
      }
      globalProductName = globalProduct.name;
    }

    // ACTION 1: Request pre-signed storage upload slot
    if (action === "request_upload") {
      if (!filename || !mimeType) {
        return NextResponse.json(
          {
            success: false,
            message:
              "filename and mimeType are required for upload authorization.",
          },
          { status: 400 },
        );
      }

      if (!ALLOWED_PRODUCT_MEDIA_TYPES.includes(mimeType.toLowerCase())) {
        return NextResponse.json(
          {
            success: false,
            message: `Unsupported product media type: ${mimeType}. Allowed: JPEG, PNG, WEBP, MP4, WEBM, PDF.`,
          },
          { status: 415 },
        );
      }

      if (size && Number(size) > MAX_PRODUCT_MEDIA_SIZE_BYTES) {
        return NextResponse.json(
          {
            success: false,
            message: `Media size exceeds ${MAX_PRODUCT_MEDIA_SIZE_BYTES / (1024 * 1024)}MB limit.`,
          },
          { status: 413 },
        );
      }

      // Generate object storage key: products/{productId}/{slot}-{hash}.webp
      const storageKey = generateProductMediaKey(
        productId,
        filename,
        slot,
        sortOrder,
      );
      const storageService = getStorageService();
      const uploadUrl = await storageService.getSignedUrl(storageKey, 1800);
      const publicCdnUrl = storageService.getUrl(storageKey);

      return NextResponse.json({
        success: true,
        message: "Centralized product media upload slot authorized.",
        data: {
          productId,
          storageKey,
          uploadUrl,
          publicCdnUrl,
          headers: { "Content-Type": mimeType },
          expiresInSeconds: 1800,
        },
      });
    }

    // ACTION 2: Save final media record to DB ProductImage table
    if (action === "save_media") {
      if (!imageUrl || typeof imageUrl !== "string") {
        return NextResponse.json(
          { success: false, message: "Valid imageUrl is required." },
          { status: 400 },
        );
      }

      if (process.env.DATABASE_URL) {
        const savedMedia = await db.productImage.create({
          data: {
            productId,
            imageUrl: imageUrl.trim(),
            altText: altText || globalProductName || "Product Media",
            sortOrder: Number(sortOrder) || 0,
          },
        });

        return NextResponse.json({
          success: true,
          message:
            "Global product media registered. Now instantly live across all stores (Ranchi, Patna, Delhi, Mobile App, Web).",
          data: savedMedia,
        });
      }

      return NextResponse.json({
        success: true,
        message: "Global product media registered (Mock).",
        data: {
          id: `img-${Date.now()}`,
          productId,
          imageUrl,
          altText,
          sortOrder,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: `Unknown action: "${action}"` },
      { status: 400 },
    );
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error
        ? error.message
        : "Failed to process product media.";
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/products/media?mediaId=...
export async function DELETE(request: Request) {
  const staff = (await getAuthenticatedStaff()) || (await getAuthenticatedAdmin());

  const isSuperAdmin =
    staff &&
    (staff.role === "SUPER_ADMIN" ||
      (staff.role as unknown as string) === "ADMIN");

  if (!isSuperAdmin) {
    return NextResponse.json(
      {
        success: false,
        message: "Forbidden. Only Super Admin can delete global product media.",
      },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get("mediaId")?.trim();

    if (!mediaId) {
      return NextResponse.json(
        { success: false, message: "mediaId parameter is required." },
        { status: 400 },
      );
    }

    if (process.env.DATABASE_URL) {
      const existing = await db.productImage.findUnique({
        where: { id: mediaId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Product media record not found." },
          { status: 404 },
        );
      }

      await db.productImage.delete({
        where: { id: mediaId },
      });

      return NextResponse.json({
        success: true,
        message: "Product media deleted from global catalog.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Product media deleted (Mock Mode).",
    });
  } catch (error: unknown) {
    const errMessage =
      error instanceof Error
        ? error.message
        : "Failed to delete product media.";
    return NextResponse.json(
      { success: false, message: errMessage },
      { status: 500 },
    );
  }
}
