//TODO: I don't fucking trust my own encryption. I need to talk to a smart person
// /server/models/keys.ts
// Server-side functions for managing encrypted API keys

import type { TypedPocketBase, UsersRecord, UserModelsResponse } from '$lib/types/pocketbase-types';
import type { Single } from '$lib/types/server';

export interface EncryptedKeyData {
  encryptedKey: string;
  iv: string;
  serverSalt: string;
}

export interface SaveKeyRequest {
  provider: string;
  modelName?: string;
  encryptedData: EncryptedKeyData;
}

export interface UserSalt {
  id: string;
  user: string;
  salt: string;
  created: string;
  updated: string;
}

/**
 * Get or create a server salt for a user
 * This salt is used in the client-side encryption process
 */
export async function GetOrCreateUserSalt(
  pb: TypedPocketBase,
  userId: string
): Promise<Single<string>> {
  let error: any | null = null;
  let notify: string = '';
  let salt: string = '';

  try {
    if (!userId) {
      error = 'User ID is required';
      return { data: salt, error, notify };
    }

    // Try to get existing salt
    try {
      const existingSalt = await pb
        .collection('userEncryptionSalts')
        .getFirstListItem(`user="${userId}"`);
      salt = existingSalt.salt;
    } catch (notFoundError) {
      // Salt doesn't exist, create a new one
      const newSaltBytes = new Uint8Array(32);
      crypto.getRandomValues(newSaltBytes);
      const newSalt = btoa(String.fromCharCode(...newSaltBytes));

      const created = await pb.collection('userEncryptionSalts').create({
        user: userId,
        salt: newSalt
      });

      salt = created.salt;
      notify = 'New encryption salt created';
    }
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to get or create user salt';
  }

  return { data: salt, error, notify };
}

/**
 * Save encrypted API key data
 * The key is already encrypted client-side before reaching here
 */
export async function SaveEncryptedApiKey(
  pb: TypedPocketBase,
  userId: string,
  request: SaveKeyRequest
): Promise<Single<UserModelsResponse>> {
  let error: any | null = null;
  let notify: string = '';
  let savedModel: UserModelsResponse = {} as UserModelsResponse;

  try {
    if (!userId || !request.encryptedData || !request.provider) {
      error = 'Missing required fields';
      return { data: savedModel, error, notify };
    }

    // Validate that we have all encryption data
    const { encryptedKey, iv, serverSalt } = request.encryptedData;
    if (!encryptedKey || !iv || !serverSalt) {
      error = 'Invalid encrypted data format';
      return { data: savedModel, error, notify };
    }

    // Save the encrypted key data
    const created = await pb.collection('userModels').create({
      user: userId,
      provider: request.provider,
      modelName: request.modelName || request.provider,
      encryptedKey: encryptedKey,
      iv: iv,
      serverSalt: serverSalt,
      isActive: true
    });

    savedModel = created as UserModelsResponse;
    notify = 'API key saved successfully';
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to save encrypted API key';
  }

  return { data: savedModel, error, notify };
}

/**
 * Get encrypted API key data for client-side decryption
 */
export async function GetEncryptedApiKey(
  pb: TypedPocketBase,
  userId: string,
  modelId: string
): Promise<Single<EncryptedKeyData>> {
  let error: any | null = null;
  let notify: string = '';
  let encryptedData: EncryptedKeyData = {} as EncryptedKeyData;

  try {
    if (!userId || !modelId) {
      error = 'User ID and Model ID are required';
      return { data: encryptedData, error, notify };
    }

    // Get the encrypted key data
    const userModel = await pb.collection('userModels').getOne(modelId, {
      filter: `user="${userId}"` // Ensure user can only access their own keys
    });

    if (!userModel.encryptedKey || !userModel.iv || !userModel.serverSalt) {
      error = 'Invalid or corrupted key data';
      return { data: encryptedData, error, notify };
    }

    encryptedData = {
      encryptedKey: userModel.encryptedKey,
      iv: userModel.iv,
      serverSalt: userModel.serverSalt
    };
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to retrieve encrypted API key';
  }

  return { data: encryptedData, error, notify };
}

/**
 * Get all encrypted keys for a user
 */
export async function GetUserEncryptedKeys(
  pb: TypedPocketBase,
  userId: string
): Promise<Single<UserModelsResponse[]>> {
  let error: any | null = null;
  let notify: string = '';
  let userModels: UserModelsResponse[] = [];

  try {
    if (!userId) {
      error = 'User ID is required';
      return { data: userModels, error, notify };
    }

    const models = await pb.collection('userModels').getFullList({
      filter: `user="${userId}"`,
      sort: '-created'
    });

    userModels = models as UserModelsResponse[];
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to retrieve user models';
  }

  return { data: userModels, error, notify };
}

/**
 * Delete an encrypted API key
 */
export async function DeleteEncryptedApiKey(
  pb: TypedPocketBase,
  userId: string,
  modelId: string
): Promise<Single<boolean>> {
  let error: any | null = null;
  let notify: string = '';
  let success: boolean = false;

  try {
    if (!userId || !modelId) {
      error = 'User ID and Model ID are required';
      return { data: success, error, notify };
    }

    // Verify ownership before deletion
    const userModel = await pb.collection('userModels').getOne(modelId, {
      filter: `user="${userId}"`
    });

    if (!userModel) {
      error = 'Model not found or access denied';
      return { data: success, error, notify };
    }

    await pb.collection('userModels').delete(modelId);
    success = true;
    notify = 'API key deleted successfully';
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to delete API key';
  }

  return { data: success, error, notify };
}

/**
 * Test if an API key is valid (after client-side decryption)
 * This function receives a temporarily decrypted key for validation
 */
export async function TestApiKeyValidity(
  provider: string,
  temporaryApiKey: string
): Promise<Single<{ isValid: boolean; model?: string }>> {
  let error: any | null = null;
  let notify: string = '';
  let result = { isValid: false, model: undefined as string | undefined };

  try {
    if (!provider || !temporaryApiKey) {
      error = 'Provider and API key are required';
      return { data: result, error, notify };
    }

    // Test the key with a minimal API call
    let testResult: boolean = false;
    let modelInfo: string | undefined;

    switch (provider.toLowerCase()) {
      case 'openai':
        const openaiResult = await testOpenAIKey(temporaryApiKey);
        testResult = openaiResult.isValid;
        modelInfo = openaiResult.model;
        break;

      case 'anthropic':
        const anthropicResult = await testAnthropicKey(temporaryApiKey);
        testResult = anthropicResult.isValid;
        modelInfo = anthropicResult.model;
        break;

      default:
        error = `Unsupported provider: ${provider}`;
        return { data: result, error, notify };
    }

    result = { isValid: testResult, model: modelInfo };
    notify = testResult ? 'API key is valid' : 'API key is invalid';
  } catch (e: any) {
    error = e;
    notify = e.message || 'Failed to test API key';
  }

  return { data: result, error, notify };
}

// Helper functions for testing API keys
async function testOpenAIKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      const defaultModel = data.data?.find((m: any) => m.id.includes('gpt-4')) || data.data?.[0];
      return { isValid: true, model: defaultModel?.id };
    }

    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

async function testAnthropicKey(apiKey: string): Promise<{ isValid: boolean; model?: string }> {
  try {
    // Anthropic doesn't have a models endpoint, so we make a minimal message request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      })
    });

    if (response.ok || response.status === 400) {
      // 400 might be rate limit but key is valid
      return { isValid: true, model: 'claude-3-haiku-20240307' };
    }

    return { isValid: false };
  } catch {
    return { isValid: false };
  }
}

// Client-side encryption utilities (to be used in browser)
export const ClientEncryption = {
  async deriveKey(user: UsersRecord, serverSalt: string): Promise<CryptoKey> {
    const userFingerprint = [user.id, user.email, user.created, serverSalt].join('|');

    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userFingerprint),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const derivationSalt = new TextEncoder().encode(user.id + serverSalt);

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

  async encrypt(apiKey: string, user: UsersRecord, serverSalt: string): Promise<EncryptedKeyData> {
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

  async decrypt(encryptedData: EncryptedKeyData, user: UsersRecord): Promise<string> {
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
