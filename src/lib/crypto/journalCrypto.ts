/**
 * Trelis Life - Clinical-Grade Zero-Knowledge Journal Cryptography
 * Uses browser-native Web Crypto API (window.crypto.subtle)
 */

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM key from a passphrase and a salt using PBKDF2 with SHA-256.
 * Standard OWASP 2024 recommended iteration count: 600,000.
 */
export async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 600000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // Must be extractable to export to keyVault
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a plaintext string using AES-GCM and a cryptographically secure 12-byte random IV.
 * Combines the 12-byte IV and the ciphertext, and returns the result as a Base64-encoded string.
 */
export async function encryptText(text: string, key: CryptoKey): Promise<string> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(text);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encodedText
  );

  const ciphertext = new Uint8Array(ciphertextBuffer);
  const combined = new Uint8Array(iv.length + ciphertext.length);
  combined.set(iv, 0);
  combined.set(ciphertext, iv.length);

  return arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypts a combined IV + ciphertext Base64-encoded string using AES-GCM.
 * Extracts the 12-byte IV, decrypts the remaining ciphertext, and decodes back to UTF-8.
 */
export async function decryptText(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToUint8Array(encryptedBase64);
  if (combined.length < 12) {
    throw new Error('Invalid ciphertext: Combined array length is less than 12 bytes.');
  }

  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    ciphertext.buffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
