// Round-trip do formato .pfdb com os mesmos parâmetros do app (WebCrypto).
import { webcrypto as crypto } from 'node:crypto';
import assert from 'node:assert';

const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = b => Buffer.from(b).toString('base64');
const unb64 = s => new Uint8Array(Buffer.from(s, 'base64'));
const MAGIC = 'PFDB1\n';

async function deriveKey(pass, salt, iter) {
  const km = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, km,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
async function encrypt(vault, pass, iter) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pass, salt, iter);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(vault)));
  return MAGIC + JSON.stringify({ v: 1, iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) });
}
async function decrypt(text, pass) {
  assert(text.startsWith(MAGIC), 'magic');
  const h = JSON.parse(text.slice(MAGIC.length));
  const key = await deriveKey(pass, unb64(h.salt), h.iter);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(h.iv) }, key, unb64(h.ct));
  return JSON.parse(dec.decode(pt));
}

const vault = { entries: [{ id: '1', title: 'Ação/teste ✓', user: 'ana', pass: 'p@ss wórd', notes: 'linha1\nlinha2' }] };
const file = await encrypt(vault, 'senha-mestre-123', 600000);

// round-trip ok
assert.deepStrictEqual(await decrypt(file, 'senha-mestre-123'), vault);
// senha errada falha
await assert.rejects(() => decrypt(file, 'errada'));
// arquivo adulterado falha (flip de 1 byte no ct)
const h = JSON.parse(file.slice(MAGIC.length));
const ct = unb64(h.ct); ct[0] ^= 1; h.ct = b64(ct);
await assert.rejects(() => decrypt(MAGIC + JSON.stringify(h), 'senha-mestre-123'));
// magic inválido falha
await assert.rejects(() => decrypt('XXXX\n{}', 'senha-mestre-123'));

console.log('OK: round-trip, senha errada, adulteração e magic — 4/4');
