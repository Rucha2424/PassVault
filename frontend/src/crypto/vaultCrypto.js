/**
 * PassVault Client-Side Encryption Module
 * Uses Web Crypto API (PBKDF2 + AES-256-GCM)
 * Zero-Knowledge Architecture: Keys never leave the client memory.
 */

const getCrypto = () => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto;
  }
  throw new Error('Web Crypto API is not supported in this environment');
};

/**
 * Convert ArrayBuffer or Uint8Array to Base64 string
 */
export const bufferToBase64 = (buffer) => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  }
  return Buffer.from(bytes).toString('base64');
};

/**
 * Convert Base64 string to Uint8Array
 */
export const base64ToBuffer = (base64) => {
  if (typeof atob !== 'undefined') {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, 'base64'));
};

/**
 * Generate cryptographically secure random salt (Base64)
 */
export const generateVaultSalt = (byteLength = 16) => {
  const cryptoObj = getCrypto();
  const salt = new Uint8Array(byteLength);
  cryptoObj.getRandomValues(salt);
  return bufferToBase64(salt);
};

/**
 * Derive an AES-256-GCM CryptoKey from master password and user's vault salt using PBKDF2
 * @param {string} masterPassword - The user's master password
 * @param {string} saltBase64 - Base64 encoded per-user salt
 * @param {number} iterations - PBKDF2 iteration count (default 100,000)
 * @returns {Promise<CryptoKey>}
 */
export const deriveVaultKey = async (masterPassword, saltBase64, iterations = 100000) => {
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;
  const encoder = new TextEncoder();

  // Import raw master password as key material
  const passwordKey = await subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBytes = base64ToBuffer(saltBase64);

  // Derive AES-256-GCM key
  const vaultKey = await subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false, // Key cannot be extracted
    ['encrypt', 'decrypt']
  );

  return vaultKey;
};

/**
 * Encrypt plaintext string using AES-256-GCM with a unique 12-byte IV
 * @param {string} plaintext - Plaintext string
 * @param {CryptoKey} vaultKey - The derived AES-GCM CryptoKey
 * @returns {Promise<{ ciphertext: string, iv: string }>}
 */
export const encryptVaultData = async (plaintext, vaultKey) => {
  if (plaintext === null || plaintext === undefined) {
    plaintext = '';
  }
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;
  const encoder = new TextEncoder();

  // Generate unique 12-byte (96-bit) IV for GCM mode
  const iv = new Uint8Array(12);
  cryptoObj.getRandomValues(iv);

  const encryptedBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
      tagLength: 128,
    },
    vaultKey,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv),
  };
};

/**
 * Decrypt ciphertext using AES-256-GCM
 * @param {string} ciphertextBase64 - Base64 ciphertext with authentication tag
 * @param {string} ivBase64 - Base64 IV
 * @param {CryptoKey} vaultKey - The derived AES-GCM CryptoKey
 * @returns {Promise<string>} - Decrypted plaintext string
 */
export const decryptVaultData = async (ciphertextBase64, ivBase64, vaultKey) => {
  if (!ciphertextBase64 || !ivBase64) {
    return '';
  }
  const cryptoObj = getCrypto();
  const subtle = cryptoObj.subtle;
  const decoder = new TextDecoder();

  const ciphertextBytes = base64ToBuffer(ciphertextBase64);
  const ivBytes = base64ToBuffer(ivBase64);

  try {
    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
        tagLength: 128,
      },
      vaultKey,
      ciphertextBytes
    );

    return decoder.decode(decryptedBuffer);
  } catch (error) {
    throw new Error('Decryption failed: integrity check failed or incorrect key (tampered data)');
  }
};
