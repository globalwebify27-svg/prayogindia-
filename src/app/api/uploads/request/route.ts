import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthSessionUser } from '@/lib/authUtils';
import {
  generateStorageKey,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
  getStorageService,
} from '@/lib/storage';

async function getAuthenticatedUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('prayog_customer_session');
  if (!sessionCookie?.value) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * POST /api/uploads/request
 * Validates file type, size, context, and generates a pre-signed upload token & storage key.
 */
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { filename, mimeType, size, context = 'SUPPORT_ATTACHMENT', ticketId } = body;

    // 1. Context Authorization Check
    // Customers can ONLY upload SUPPORT_ATTACHMENT (cannot upload product/service/offer media)
    if (context !== 'SUPPORT_ATTACHMENT') {
      return NextResponse.json(
        { success: false, message: 'Forbidden. Customers can only upload support ticket attachments.' },
        { status: 403 }
      );
    }

    // 2. File Metadata Validation
    if (!filename || typeof filename !== 'string' || filename.trim().length < 1) {
      return NextResponse.json({ success: false, message: 'Valid filename is required.' }, { status: 400 });
    }

    if (!mimeType || typeof mimeType !== 'string' || !ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: `Unsupported file type "${mimeType}". Allowed types: JPEG, PNG, WEBP, PDF.` },
        { status: 415 }
      );
    }

    const fileSizeNum = parseInt(String(size), 10);
    if (isNaN(fileSizeNum) || fileSizeNum <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid file size.' }, { status: 400 });
    }

    if (fileSizeNum > MAX_ATTACHMENT_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: `File size exceeds the 10MB limit (requested: ${(fileSizeNum / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 413 }
      );
    }

    // 3. Key Generation & Pre-signed Authorization
    const storageKey = generateStorageKey(context, user.id, filename);
    const storageService = getStorageService();
    const uploadUrl = await storageService.getSignedUrl(storageKey, 900); // 15-min upload window

    return NextResponse.json({
      success: true,
      message: 'Upload authorization granted.',
      data: {
        storageKey,
        uploadUrl,
        headers: {
          'Content-Type': mimeType,
        },
        expiresInSeconds: 900,
        ticketId: ticketId || null,
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to request upload authorization.' },
      { status: 500 }
    );
  }
}
