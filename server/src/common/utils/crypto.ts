import crypto from "node:crypto";

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}
