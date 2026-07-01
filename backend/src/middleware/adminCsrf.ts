import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types.js";
import { query } from "../services/db.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export async function adminCsrf(req: AuthRequest, res: Response, next: NextFunction) {
  if (safeMethods.has(req.method)) return next();
  const csrfToken = req.header("x-csrf-token");
  if (!csrfToken) return res.status(403).json({ error: "CSRF token is required" });
  const result = await query(
    "SELECT id FROM refresh_tokens WHERE csrf_token=$1 AND revoked_at IS NULL AND expires_at > now() LIMIT 1",
    [csrfToken]
  );
  if (!result.rows[0]) return res.status(403).json({ error: "Invalid CSRF token" });
  next();
}
