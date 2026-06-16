import { admin } from "./supabase";

// Admin authentication now lives in Supabase Auth. The client signs in with a
// Supabase user (email/password) and sends the access token as a Bearer header.
// We verify the token server-side and authorize the user as an admin if either:
//   * their JWT app_metadata.role === "admin", or
//   * their email is in the ADMIN_EMAIL allowlist (comma-separated).

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function bearer(req: any): string {
  const h = req.headers["authorization"] || req.headers["Authorization"] || "";
  return String(h).replace(/^Bearer\s+/i, "").trim();
}

export async function requireAdmin(req: any, res: any): Promise<boolean> {
  const token = bearer(req);
  if (!token) {
    res.status(401).json({ error: "Not signed in." });
    return false;
  }
  try {
    const { data, error } = await admin().auth.getUser(token);
    const user = data?.user;
    if (error || !user) {
      res.status(401).json({ error: "Session expired — please sign in again." });
      return false;
    }
    const role = (user.app_metadata as any)?.role;
    const allow = adminEmails();
    const isAdmin =
      role === "admin" ||
      (allow.length > 0 && allow.includes((user.email || "").toLowerCase()));
    if (!isAdmin) {
      res.status(403).json({ error: "This account is not authorized for admin." });
      return false;
    }
    return true;
  } catch {
    res.status(401).json({ error: "Could not verify session." });
    return false;
  }
}
