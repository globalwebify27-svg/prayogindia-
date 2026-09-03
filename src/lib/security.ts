/**
 * Prayog India Security & Utility Layer (B11)
 * Includes XSS sanitization, rate limiting, structured logging, and security headers.
 */

// 1. XSS Input Sanitization Helper
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// 2. Sliding-Window Rate Limiter
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  limit = 10,
  windowMs = 60 * 1000,
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const bucket = rateLimitStore.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    resetInSeconds: Math.ceil((bucket.resetAt - now) / 1000),
  };
}

// 3. Structured Server Logger with Sensitive Field Redaction
const SENSITIVE_KEYS = [
  "password",
  "passwordhash",
  "token",
  "secret",
  "cookie",
  "authorization",
];

export function redactSensitiveData(
  data: Record<string, any>,
): Record<string, any> {
  if (!data || typeof data !== "object") return {};
  const copy: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      copy[key] = "[REDACTED]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      copy[key] = redactSensitiveData(value);
    } else {
      copy[key] = value;
    }
  }

  return copy;
}

export const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(
      JSON.stringify({
        level: "info",
        message,
        meta: redactSensitiveData(meta || {}),
        timestamp: new Date().toISOString(),
      }),
    );
  },
  warn: (message: string, meta?: Record<string, any>) => {
    console.warn(
      JSON.stringify({
        level: "warn",
        message,
        meta: redactSensitiveData(meta || {}),
        timestamp: new Date().toISOString(),
      }),
    );
  },
  error: (message: string, meta?: Record<string, any>) => {
    console.error(
      JSON.stringify({
        level: "error",
        message,
        meta: redactSensitiveData(meta || {}),
        timestamp: new Date().toISOString(),
      }),
    );
  },
};

// 4. Production Security Headers Helper
export function getSecurityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}
