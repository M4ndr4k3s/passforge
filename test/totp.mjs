// TOTP contra os vetores de teste oficiais da RFC 6238 (Apêndice B),
// com a mesma implementação do app (WebCrypto).
import { webcrypto as crypto } from 'node:crypto';
import assert from 'node:assert';

function b32dec(s) {
  s = s.toUpperCase().replace(/[\s=-]/g, '');
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, val = 0; const out = [];
  for (const c of s) {
    const i = A.indexOf(c); if (i < 0) throw new Error('base32');
    val = (val << 5) | i; bits += 5;
    if (bits >= 8) { bits -= 8; out.push(val >>> bits & 255); }
  }
  return new Uint8Array(out);
}
function b32enc(bytes) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, val = 0, out = '';
  for (const b of bytes) {
    val = (val << 8) | b; bits += 8;
    while (bits >= 5) { bits -= 5; out += A[val >>> bits & 31]; }
  }
  if (bits) out += A[(val << (5 - bits)) & 31];
  return out;
}
async function totpCode(cfg, now) {
  const key = await crypto.subtle.importKey('raw', b32dec(cfg.secret), { name: 'HMAC', hash: cfg.algo }, false, ['sign']);
  const ctr = new DataView(new ArrayBuffer(8));
  ctr.setBigUint64(0, BigInt(Math.floor(now / 1000 / cfg.period)));
  const h = new Uint8Array(await crypto.subtle.sign('HMAC', key, ctr.buffer));
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24 | h[o + 1] << 16 | h[o + 2] << 8 | h[o + 3]) % 10 ** cfg.digits;
  return String(n).padStart(cfg.digits, '0');
}

const ascii = s => new Uint8Array([...s].map(c => c.charCodeAt(0)));
const sec20 = b32enc(ascii('12345678901234567890'));                 // SHA-1
const sec32 = b32enc(ascii('12345678901234567890123456789012'));    // SHA-256
const sec64 = b32enc(ascii('1234567890123456789012345678901234567890123456789012345678901234')); // SHA-512

const vectors = [
  [59, 'SHA-1', sec20, '94287082'], [59, 'SHA-256', sec32, '46119246'], [59, 'SHA-512', sec64, '90693936'],
  [1111111109, 'SHA-1', sec20, '07081804'], [1111111111, 'SHA-1', sec20, '14050471'],
  [1234567890, 'SHA-1', sec20, '89005924'], [2000000000, 'SHA-256', sec32, '90698825'],
  [20000000000, 'SHA-512', sec64, '47863826'],
];
for (const [t, algo, secret, want] of vectors) {
  const got = await totpCode({ secret, digits: 8, period: 30, algo }, t * 1000);
  assert.strictEqual(got, want, `t=${t} ${algo}`);
}

// base32 com espaços, hífens e minúsculas (formato comum de sites) decodifica igual
assert.deepStrictEqual(b32dec('gezd gnbv-gy3t qojq'), b32dec('GEZDGNBVGY3TQOJQ'));
// segredo inválido rejeita
assert.throws(() => b32dec('não-é-base32!'));

console.log(`OK: ${vectors.length} vetores RFC 6238 (SHA-1/256/512) + normalização base32`);
