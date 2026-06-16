import { checkCredentials, issueToken } from "../_lib/auth";

// POST /api/admin/login { email, password } → { token }
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { email, password } = req.body || {};
  if (!checkCredentials(email || "", password || "")) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }
  res.status(200).json({
    token: issueToken(String(email).trim().toLowerCase()),
    name: process.env.ADMIN_NAME || "Admin",
  });
}
