import crypto from 'crypto'; import bcrypt from 'bcryptjs';
const COOKIE = 'spnews_admin';
function secret() { return process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'spnews-dev-secret'; }
export function signSession(email: string): string {
  const exp = Date.now() + 7*24*60*60*1000;
  // base64url payload so dots in the email can't break parsing
  const payload = Buffer.from(`${email}.${exp}`).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}
export function verifySession(token?: string | null): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf('.'); if (idx < 0) return null;
  const payload = token.slice(0, idx); const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret()).update(payload).digest('hex');
  if (sig !== expected) return null;
  let decoded: string; try { decoded = Buffer.from(payload, 'base64url').toString('utf8'); } catch { return null; }
  const dot = decoded.lastIndexOf('.'); if (dot < 0) return null;
  const email = decoded.slice(0, dot); const exp = Number(decoded.slice(dot + 1));
  if (!email || Date.now() > exp) return null;
  return email;
}
export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL; const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !hash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  try { return await bcrypt.compare(password, hash); } catch { return false; }
}
export function adminConfigured(): boolean { return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH); }
export const ADMIN_COOKIE = COOKIE;
