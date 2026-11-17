// Edge-runtime-safe session verification (Web Crypto, no Node 'crypto').
// Must match the HMAC-SHA256 hex signature produced by lib/auth.ts signSession.
function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function verifySessionEdge(token?: string | null): Promise<string | null> {
  if (!token) return null;
  const idx = token.lastIndexOf('.'); if (idx < 0) return null;
  const payload = token.slice(0, idx); const sig = token.slice(idx + 1);
  const secret = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || 'spnews-dev-secret';
  try {
    const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    if (toHex(mac) !== sig) return null;
    const decoded = b64urlDecode(payload);
    const dot = decoded.lastIndexOf('.'); if (dot < 0) return null;
    const email = decoded.slice(0, dot); const exp = Number(decoded.slice(dot + 1));
    if (!email || Date.now() > exp) return null;
    return email;
  } catch { return null; }
}
