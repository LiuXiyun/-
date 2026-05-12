import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "@/lib/env";

const ALGORITHM = "aes-256-gcm";

function getKey() {
  return createHash("sha256").update(env.ENCRYPTION_SECRET).digest();
}

export function encryptText(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}:${tag.toString("base64")}:${encrypted.toString("base64")}`;
}

export function decryptText(payload: string) {
  const [ivBase64, tagBase64, contentBase64] = payload.split(":");
  if (!ivBase64 || !tagBase64 || !contentBase64) {
    return payload;
  }

  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivBase64, "base64"));
  decipher.setAuthTag(Buffer.from(tagBase64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(contentBase64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
