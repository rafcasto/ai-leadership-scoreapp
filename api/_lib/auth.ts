import crypto from "crypto";

// Lightweight signed admin session token (HMAC). No external dep.
// Token = base64url(payloadJson) + "." + base64url(hmac).

function secret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "change-me-in-prod"
  );
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(payload: string): string {
  return b64url(
    crypto.createHmac("sha256", secret()).update(payload).digest()
  );
}

export function issueToken(email: string): string {
  const payload = JSON.stringify({
    email,
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12h
  });
  const p = b64url(payload);
  return `${p}.${sign(p)}`;
}

export function verifyToken(token?: string | null): boolean {
  if (!token) return false;
  const [p, sig] = token.split(".");
  if (!p || !sig) return false;
  if (sign(p) !== sig) return false;
  try {
    const data = JSON.parse(Buffer.from(p, "base64").toString());
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export function requireAdmin(req: any, res: any): boolean {
  const header = req.headers["authorization"] || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!verifyToken(token)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function checkCredentials(email: string, password: string): boolean {
  const okEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const okPass = process.env.ADMIN_PASSWORD || "";
  // constant-time-ish compare
  const a = (email || "").trim().toLowerCase();
  return (
    !!okEmail &&
    !!okPass &&
    a === okEmail &&
    crypto.timingSafeEqual(
      Buffer.from(password.padEnd(64).slice(0, 64)),
      Buffer.from(okPass.padEnd(64).slice(0, 64))
    )
  );
}
