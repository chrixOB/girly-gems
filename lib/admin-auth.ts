import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "girly_gems_admin_session";
export const TEST_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const TEST_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "GirlyGems123!";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "girly-gems-local-development-secret";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = Buffer.from(TEST_ADMIN_USERNAME);
  const providedUsername = Buffer.from(username);
  const expectedPassword = Buffer.from(TEST_ADMIN_PASSWORD);
  const providedPassword = Buffer.from(password);

  const usernameMatches = expectedUsername.length === providedUsername.length && timingSafeEqual(expectedUsername, providedUsername);
  const passwordMatches = expectedPassword.length === providedPassword.length && timingSafeEqual(expectedPassword, providedPassword);

  return usernameMatches && passwordMatches;
}

export function createAdminSession(username: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString("base64url");
  const signature = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSession(token: string | undefined) {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expectedSignature = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { username: string; expiresAt: number };
    return session.username === TEST_ADMIN_USERNAME && session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}
