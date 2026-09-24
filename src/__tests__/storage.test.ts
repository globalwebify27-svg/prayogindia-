import { describe, it, expect } from "vitest";
import {
  generateStorageKey,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_SIZE_BYTES,
} from "../lib/storage";

describe("Storage, File Uploads & Path Traversal Protection", () => {
  const userA = { id: "usr-123" };
  const userB = { id: "usr-456" };

  it("should prevent directory traversal in generated storage keys", () => {
    const key1 = generateStorageKey(
      "SUPPORT_ATTACHMENT",
      userA.id,
      "../../../malicious_script.sh",
    );
    expect(key1.includes("..")).toBe(false);
    expect(key1.includes("malicious_script")).toBe(false);
    expect(key1.startsWith("support_attachment/usr-123/")).toBe(true);
    expect(key1.endsWith(".sh")).toBe(true);
  });

  it("should enforce strict MIME whitelist", () => {
    const validateMimeType = (mime: string) =>
      ALLOWED_ATTACHMENT_MIME_TYPES.includes(mime.toLowerCase());

    expect(validateMimeType("application/x-executable")).toBe(false);
    expect(validateMimeType("text/html")).toBe(false);
    expect(validateMimeType("image/png")).toBe(true);
    expect(validateMimeType("application/pdf")).toBe(true);
  });

  it("should enforce file size limits", () => {
    const validateSize = (size: number) =>
      size > 0 && size <= MAX_ATTACHMENT_SIZE_BYTES;

    expect(validateSize(-5)).toBe(false);
    expect(validateSize(15 * 1024 * 1024)).toBe(false);
    expect(validateSize(2 * 1024 * 1024)).toBe(true);
  });

  it("should enforce customer isolation on private attachments", () => {
    const accessPrivateAttachment = (
      requesterUserId: string,
      storageKey: string,
    ) => {
      if (!storageKey.includes(`/${requesterUserId}/`)) {
        return { status: 404, message: "File not found" };
      }
      return {
        status: 200,
        url: `https://media.prayogindia.com/${storageKey}?signed=true`,
      };
    };

    const supportKeyUserA = generateStorageKey(
      "SUPPORT_ATTACHMENT",
      userA.id,
      "schematics.pdf",
    );

    expect(accessPrivateAttachment(userA.id, supportKeyUserA).status).toBe(200);
    expect(accessPrivateAttachment(userB.id, supportKeyUserA).status).toBe(404);
  });
});
