import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
export function DeriveKey(password: string): Buffer {
  return scryptSync(password, 'api-keys-salt', 32);
}

export function Decrypt(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');

  const key = DeriveKey(process.env.ENCRYPTION_KEY!);
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = createDecipheriv(process.env.ALGORITHM!, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function Encrypt(text: string): string {
  const key = DeriveKey(process.env.ENCRYPTION_KEY!);
  const iv = randomBytes(16);

  const cipher = createCipheriv(process.env.ALGORITHM!, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}
