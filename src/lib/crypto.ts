//TODO: good enough for now, check back in a few weeks
import type { AuthRecord } from 'pocketbase';
import type { UsersRecord } from './types/pocketbase-types';

export interface EncryptedKeyData {
  encryptedKey: string;
  iv: string;
  serverSalt: string;
}

export const ClientEncryption = {
  async deriveKey(user: AuthRecord, serverSalt: string): Promise<CryptoKey> {
    const userFingerprint = [user?.id, user?.email, user?.created, serverSalt].join('|');

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userFingerprint),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivationSalt = new TextEncoder().encode(user?.id + serverSalt);

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: derivationSalt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encrypt(apiKey: string, user: AuthRecord, serverSalt: string): Promise<EncryptedKeyData> {
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await this.deriveKey(user, serverSalt);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(apiKey)
    );

    return {
      encryptedKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
      serverSalt
    };
  },

  async decrypt(encryptedData: EncryptedKeyData, user: AuthRecord): Promise<string> {
    const decoder = new TextDecoder();

    const iv = new Uint8Array(
      atob(encryptedData.iv)
        .split('')
        .map((c) => c.charCodeAt(0))
    );
    const encrypted = new Uint8Array(
      atob(encryptedData.encryptedKey)
        .split('')
        .map((c) => c.charCodeAt(0))
    );

    const key = await this.deriveKey(user, encryptedData.serverSalt);

    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encrypted);

    return decoder.decode(decrypted);
  }
};
