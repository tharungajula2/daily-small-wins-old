import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { Capacitor } from '@capacitor/core';
import { arrayBufferToBase64, base64ToUint8Array } from './journalCrypto';

const JOURNAL_KEY_STORE_NAME = 'trelis_journal_key';

// Web Fallback: Keep an in-memory key cache for fast resolution
let inMemoryKey: CryptoKey | null = null;

export { retrieveJournalKey as getKey };

/**
 * Saves a CryptoKey to the native hardware secure storage (Android Keystore / iOS Keychain)
 * on mobile, or standard localStorage when running on web.
 */
export async function storeJournalKey(key: CryptoKey): Promise<void> {
  const exportedRaw = await window.crypto.subtle.exportKey('raw', key);
  const base64Key = arrayBufferToBase64(exportedRaw);

  inMemoryKey = key;

  if (Capacitor.isNativePlatform()) {
    await SecureStoragePlugin.set({
      key: JOURNAL_KEY_STORE_NAME,
      value: base64Key,
    });
  } else {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(JOURNAL_KEY_STORE_NAME, base64Key);
    }
  }
}

/**
 * Retrieves a CryptoKey from native secure storage or web fallback,
 * recreating the CryptoKey object from the raw base64 bytes.
 */
export async function retrieveJournalKey(): Promise<CryptoKey | null> {
  if (inMemoryKey) {
    return inMemoryKey;
  }

  let base64Key: string | null = null;

  try {
    if (Capacitor.isNativePlatform()) {
      const { value } = await SecureStoragePlugin.get({
        key: JOURNAL_KEY_STORE_NAME,
      });
      base64Key = value;
    } else {
      if (typeof window !== 'undefined') {
        base64Key = window.localStorage.getItem(JOURNAL_KEY_STORE_NAME);
      }
    }
  } catch (err) {
    // capacitor-secure-storage-plugin throws when a key does not exist.
    // Handle gracefully by returning null.
    return null;
  }

  if (!base64Key) {
    return null;
  }

  try {
    const rawKeyArray = base64ToUint8Array(base64Key);
    const key = await window.crypto.subtle.importKey(
      'raw',
      rawKeyArray as any,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    inMemoryKey = key;
    return key;
  } catch (err) {
    console.error('Failed to import retrieved journal key:', err);
    return null;
  }
}

/**
 * Clears the stored journal key from both local cache and persistent secure storage.
 */
export async function clearJournalKey(): Promise<void> {
  inMemoryKey = null;

  try {
    if (Capacitor.isNativePlatform()) {
      await SecureStoragePlugin.remove({
        key: JOURNAL_KEY_STORE_NAME,
      });
    } else {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(JOURNAL_KEY_STORE_NAME);
      }
    }
  } catch (err) {
    // Ignore key storage clear errors
  }
}
