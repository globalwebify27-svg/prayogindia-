// src/app/api/pos/sessions/route.ts
// Walk-in POS session persistence API
// Used by manager POS to poll for sessions from other devices

import { NextResponse } from "next/server";
import { getSecurityHeaders } from "@/lib/security";

// In-memory session store (resets on server restart, but that's acceptable for in-store use)
// In production this could be replaced with Redis or a DB table
const memoryStore: Record<string, object[]> = {};

export async function GET(request: Request) {
  const headers = getSecurityHeaders();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { success: false, message: "Missing storeId param" },
      { status: 400, headers },
    );
  }

  const sessions = memoryStore[storeId] || [];
  return NextResponse.json({ success: true, sessions }, { headers });
}

export async function POST(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();
    const { storeId, session } = body;

    if (!storeId || !session) {
      return NextResponse.json(
        { success: false, message: "Missing storeId or session" },
        { status: 400, headers },
      );
    }

    if (!memoryStore[storeId]) {
      memoryStore[storeId] = [];
    }

    // Upsert: replace existing session with same ID
    const existing = memoryStore[storeId].findIndex(
      (s: any) => s.id === session.id,
    );
    if (existing >= 0) {
      memoryStore[storeId][existing] = session;
    } else {
      memoryStore[storeId].unshift(session);
    }

    // Keep at most 100 sessions per store
    if (memoryStore[storeId].length > 100) {
      memoryStore[storeId] = memoryStore[storeId].slice(0, 100);
    }

    return NextResponse.json({ success: true, session }, { headers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}

export async function PATCH(request: Request) {
  const headers = getSecurityHeaders();
  try {
    const body = await request.json();
    const { storeId, sessionId, updates } = body;

    if (!storeId || !sessionId || !updates) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers },
      );
    }

    if (!memoryStore[storeId]) {
      return NextResponse.json(
        { success: false, message: "No sessions for store" },
        { status: 404, headers },
      );
    }

    const idx = memoryStore[storeId].findIndex((s: any) => s.id === sessionId);
    if (idx < 0) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404, headers },
      );
    }

    memoryStore[storeId][idx] = {
      ...(memoryStore[storeId][idx] as object),
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, session: memoryStore[storeId][idx] },
      { headers },
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers },
    );
  }
}
