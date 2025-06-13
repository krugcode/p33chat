// TODO: good enough for now, but a lil too silly for deploy
import { createCipheriv, randomBytes, scryptSync } from 'crypto';
import { env } from '$env/dynamic/private';

export function DeriveKey(password: string): Buffer {
  return scryptSync(password, 'api-keys-salt', 32);
}
export function Encrypt(text: string): string {
  const key = DeriveKey(env.PUBLIC_ENCRYPTION_KEY!);
  const iv = randomBytes(16);

  const cipher = createCipheriv(env.ALGORITHM!, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
}
