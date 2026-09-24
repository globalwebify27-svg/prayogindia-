import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { AuditActionCategory } from "@prisma/client";
import { StaffSessionUser } from "./staffAuth";
import { AdminSessionUser } from "./adminAuth";

export interface RecordAuditParams {
  actionCategory: AuditActionCategory;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  actor?:
    | StaffSessionUser
    | AdminSessionUser
    | {
        id?: string | null;
        name?: string | null;
        role?: string | null;
        email?: string | null;
      }
    | null;
  storeId?: string | null;
  previousValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown> | null;
  req?: NextRequest | Request | null;
}

/**
 * Extracts client IP safely from request headers
 */
export function extractClientIp(
  req?: NextRequest | Request | null,
): string | null {
  if (!req) return null;
  try {
    const headers = req.headers;
    const xForwardedFor = headers.get("x-forwarded-for");
    if (xForwardedFor) {
      const parts = xForwardedFor.split(",");
      if (parts.length > 0) return parts[0].trim();
    }
    const realIp = headers.get("x-real-ip");
    if (realIp) return realIp.trim();
    const cfConnectingIp = headers.get("cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp.trim();
  } catch {
    // Ignore extraction errors
  }
  return null;
}

/**
 * Extracts client User-Agent safely
 */
export function extractUserAgent(
  req?: NextRequest | Request | null,
): string | null {
  if (!req) return null;
  try {
    return req.headers.get("user-agent") || null;
  } catch {
    return null;
  }
}

/**
 * Strips sensitive fields (passwords, tokens, PINs) from logged objects
 */
function sanitizeAuditData(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeAuditData);
  }

  const sensitiveKeys = new Set([
    "password",
    "passwordhash",
    "password_hash",
    "pin",
    "pinhash",
    "pin_hash",
    "token",
    "refreshtoken",
    "secret",
    "authorization",
    "cookie",
    "apikey",
    "api_key",
  ]);

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (sensitiveKeys.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeAuditData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Central Audit Logger Service
 * Never throws an error to the caller — failures are logged to stderr so business operations succeed smoothly.
 */
export async function recordAuditLog(params: RecordAuditParams): Promise<void> {
  try {
    const actorId = params.actor?.id || null;
    const actorName = params.actor?.name || "System";
    const actorRole = params.actor?.role || "SYSTEM";
    const actorEmail =
      "email" in (params.actor || {})
        ? (params.actor?.email as string) || null
        : null;

    const ipAddress = extractClientIp(params.req);
    const userAgent = extractUserAgent(params.req);

    const prevStr =
      params.previousValue !== undefined
        ? typeof params.previousValue === "object"
          ? JSON.stringify(sanitizeAuditData(params.previousValue))
          : String(params.previousValue)
        : null;

    const newStr =
      params.newValue !== undefined
        ? typeof params.newValue === "object"
          ? JSON.stringify(sanitizeAuditData(params.newValue))
          : String(params.newValue)
        : null;

    const metaJson = params.metadata
      ? (sanitizeAuditData(params.metadata) as any)
      : undefined;

    await prisma.auditLog.create({
      data: {
        actionCategory: params.actionCategory,
        action: params.action,
        entityType: params.entityType,
        entityId: String(params.entityId),
        description: params.description,
        actorId,
        actorName,
        actorRole: String(actorRole),
        actorEmail,
        storeId: params.storeId || null,
        previousValue: prevStr,
        newValue: newStr,
        metadata: metaJson ?? null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("[AuditLogger] Failed to write audit log record:", error);
  }
}
