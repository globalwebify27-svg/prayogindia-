import { NextResponse } from "next/server";
import { AuthSessionUser, getAuthenticatedCustomer } from "@/lib/authUtils";
import { getStorageService } from "@/lib/storage";

const getAuthenticatedUser = getAuthenticatedCustomer;

/**
 * GET /api/uploads/[id]
 * Retrieves file access URL. Enforces strict Customer Isolation for private attachments.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const keyOrId = decodeURIComponent(resolvedParams.id);

  if (!keyOrId) {
    return NextResponse.json(
      { success: false, message: "Media ID or key is required." },
      { status: 400 },
    );
  }

  // 1. If key is a private support attachment path (support/user-id/...)
  if (keyOrId.startsWith("support/")) {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthenticated" },
        { status: 401 },
      );
    }

    // Customer Isolation Check: Verify storage key belongs to authenticated user
    if (!keyOrId.includes(`/${user.id}/`)) {
      return NextResponse.json(
        { success: false, message: "Media file not found." },
        { status: 404 },
      );
    }

    const storageService = getStorageService();
    const signedUrl = await storageService.getSignedUrl(keyOrId, 3600); // 1-hour access

    return NextResponse.json({
      success: true,
      data: {
        key: keyOrId,
        url: signedUrl,
        isPrivate: true,
      },
    });
  }

  // 2. Public media (products, services, learning, offers)
  const storageService = getStorageService();
  const publicUrl = storageService.getUrl(keyOrId);

  return NextResponse.json({
    success: true,
    data: {
      key: keyOrId,
      url: publicUrl,
      isPrivate: false,
    },
  });
}
