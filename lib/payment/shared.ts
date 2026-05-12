import { randomBytes } from "crypto";

export function normalizePem(text: string) {
  return text.replace(/\\n/g, "\n").trim();
}

export function toTwoDecimals(value: number) {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function cnyToFen(amountCny: number) {
  return Math.round(amountCny * 100);
}

export function buildOrderNo(prefix: string) {
  const rand = randomBytes(3).toString("hex");
  return `${prefix}${Date.now()}${rand}`.slice(0, 32);
}

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
