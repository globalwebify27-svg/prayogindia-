import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET_STRING =
  process.env.AUTH_SECRET ||
  process.env.JWT_SECRET ||
  "prayog-india-super-secret-key-production-hardened-2026";

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

/**
 * Sign a cryptographic JWT session token (HS256)
 */
export async function signSessionToken<T extends Record<string, any>>(
  payload: T,
  expiresIn: string = "7d",
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify a cryptographic JWT session token
 * Returns the decoded payload or null if invalid/expired/forged.
 */
export async function verifySessionToken<T extends Record<string, any>>(
  token: string,
): Promise<T | null> {
  try {
    if (!token || typeof token !== "string") return null;

    // Handle legacy raw JSON gracefully during rolling migration if any
    if (token.startsWith("{") && token.endsWith("}")) {
      try {
        const parsed = JSON.parse(token);
        // Only accept legacy raw JSON in non-production development
        if (process.env.NODE_ENV === "development") {
          return parsed as T;
        }
        return null;
      } catch {
        return null;
      }
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as T;
  } catch {
    return null;
  }
}
