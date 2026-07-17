  import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET;
if (!JWT_SECRET) console.warn("⚠️ ADMIN_JWT_SECRET is not set!");

export function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

// Verify admin token from cookie (used by server-side admin APIs)
export function verifyAdminCookie(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}
