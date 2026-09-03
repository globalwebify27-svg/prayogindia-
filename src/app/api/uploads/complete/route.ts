import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthSessionUser } from "@/lib/authUtils";
import { getStorageService } from "@/lib/storage";

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("prayog_customer_session");
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/uploads/complete
 * Verifies upload completion and registers media metadata record.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      storageKey,
      originalName,
      mimeType,
      size,
      context = "SUPPORT_ATTACHMENT",
      ticketId,
    } = body;

    if (!storageKey || typeof storageKey !== "string") {
      return NextResponse.json(
        { success: false, message: "Storage key is required." },
        { status: 400 },
      );
    }

    // Security Check: Customer can only finalize objects in their own user directory
    if (!storageKey.includes(`/${user.id}/`)) {
      return NextResponse.json(
        { success: false, message: "Forbidden storage key." },
        { status: 403 },
      );
    }

    const storageService = getStorageService();
    const publicOrAccessUrl = storageService.getUrl(storageKey);

    const mediaMetadata = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      storageKey,
      originalName: originalName || "attachment",
      mimeType: mimeType || "application/octet-stream",
      size: parseInt(String(size || 0), 10),
      url: publicOrAccessUrl,
      isPrivate: context === "SUPPORT_ATTACHMENT",
      context,
      userId: user.id,
      ticketId: ticketId || null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Upload completed and metadata registered.",
      data: mediaMetadata,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to complete upload registration.",
      },
      { status: 500 },
    );
  }
}
