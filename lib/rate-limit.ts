// Simple in-memory rate limiter for auth/newsletter/contact APIs.
const hits = new Map<string, { count: number; reset: number }>();
export function rateLimit(key: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now(); const e = hits.get(key);
  if (!e || now > e.reset) { hits.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (e.count >= limit) return false;
  e.count++; return true;
}
