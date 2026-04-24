import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const masterKey = Buffer.from(env.encryptionKey, 'hex'); // 32 bytes

// Format: <iv_b64url>:<authTag_b64url>:<ciphertext_b64url>
// A fresh random IV is generated per encryption, so identical plaintexts
// produce different ciphertexts. The auth tag ensures tamper detection.

export function encryptKey(plaintext: string): string {
  const iv = randomBytes(12); // 96-bit IV is the GCM recommendation
  const cipher = createCipheriv(ALGORITHM, masterKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return [
    iv.toString('base64url'),
    cipher.getAuthTag().toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':');
}

export function decryptKey(ciphertext: string): string {
  const parts = ciphertext.split(':');
  if (parts.length !== 3) throw new Error('Malformed ciphertext: expected iv:tag:data');
  const [ivB64, tagB64, encB64] = parts as [string, string, string];

  const decipher = createDecipheriv(
    ALGORITHM,
    masterKey,
    Buffer.from(ivB64, 'base64url')
  );
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));

  return Buffer.concat([
    decipher.update(Buffer.from(encB64, 'base64url')),
    decipher.final(),
  ]).toString('utf8');
}
