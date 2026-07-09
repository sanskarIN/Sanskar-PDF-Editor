// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// Purpose: AES-256-GCM Encryption Engine for military-grade PDF locking
// =============================================================================

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * Derives an AES-GCM CryptoKey from a given password and salt.
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a Uint8Array (PDF payload) using a password.
 * Returns a new Uint8Array combining [Salt + IV + Ciphertext].
 */
export async function encryptPDF(data: Uint8Array, password: string): Promise<Uint8Array> {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  const encryptedData = new Uint8Array(encryptedBuffer);
  
  // Pack: Salt (16) + IV (12) + Encrypted Data
  const packed = new Uint8Array(salt.length + iv.length + encryptedData.length);
  packed.set(salt, 0);
  packed.set(iv, salt.length);
  packed.set(encryptedData, salt.length + iv.length);
  
  return packed;
}

/**
 * Decrypts a packed Uint8Array [Salt + IV + Ciphertext] using a password.
 * Returns the original decrypted PDF Uint8Array.
 * Throws an error if the password is wrong or data is corrupt.
 */
export async function decryptPDF(packedData: Uint8Array, password: string): Promise<Uint8Array> {
  if (packedData.length < SALT_LENGTH + IV_LENGTH) {
    throw new Error('Invalid locked file structure.');
  }

  const salt = packedData.slice(0, SALT_LENGTH);
  const iv = packedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedData = packedData.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(password, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encryptedData
    );
    return new Uint8Array(decryptedBuffer);
  } catch (e) {
    throw new Error('Incorrect password or corrupted file.');
  }
}
