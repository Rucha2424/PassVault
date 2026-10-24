import { describe, it, expect } from 'vitest';
import {
  generateVaultSalt,
  deriveVaultKey,
  encryptVaultData,
  decryptVaultData,
  base64ToBuffer,
  bufferToBase64,
} from '../crypto/vaultCrypto';

describe('PassVault Client-Side Crypto Engine (Web Crypto API)', () => {
  it('generates a valid random base64 salt of requested length', () => {
    const salt1 = generateVaultSalt(16);
    const salt2 = generateVaultSalt(16);
    expect(salt1).toBeDefined();
    expect(salt2).toBeDefined();
    expect(salt1).not.toBe(salt2);
    expect(base64ToBuffer(salt1).byteLength).toBe(16);
  });

  it('derives an AES-256-GCM key from master password and salt', async () => {
    const salt = generateVaultSalt(16);
    const password = 'SuperSecretMasterPassword123!';
    const key = await deriveVaultKey(password, salt, 1000); // lower iterations for fast unit test
    expect(key).toBeDefined();
    expect(key.algorithm.name).toBe('AES-GCM');
    expect(key.algorithm.length).toBe(256);
    expect(key.extractable).toBe(false); // Key cannot be extracted from browser memory
  });

  it('encrypts and decrypts secret plaintext correctly', async () => {
    const salt = generateVaultSalt(16);
    const password = 'MasterPassword!987654';
    const key = await deriveVaultKey(password, salt, 1000);

    const plaintext = 'MySuperSensitiveDatabasePassword456$#@';
    const encrypted = await encryptVaultData(plaintext, key);

    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.ciphertext).not.toBe(plaintext);

    const decrypted = await decryptVaultData(encrypted.ciphertext, encrypted.iv, key);
    expect(decrypted).toBe(plaintext);
  });

  it('fails decryption and detects tampered ciphertext (AES-GCM tag mismatch)', async () => {
    const salt = generateVaultSalt(16);
    const key = await deriveVaultKey('MasterPassword123!', salt, 1000);

    const plaintext = 'SensitiveNote';
    const encrypted = await encryptVaultData(plaintext, key);

    // Tamper with the ciphertext bytes
    const bytes = base64ToBuffer(encrypted.ciphertext);
    bytes[0] ^= 0xff; // flip bits
    const tamperedCiphertext = bufferToBase64(bytes);

    await expect(
      decryptVaultData(tamperedCiphertext, encrypted.iv, key)
    ).rejects.toThrow(/integrity check failed/i);
  });

  it('fails decryption when decrypted with a different master password key', async () => {
    const salt = generateVaultSalt(16);
    const key1 = await deriveVaultKey('PasswordOne!123', salt, 1000);
    const key2 = await deriveVaultKey('PasswordTwo!456', salt, 1000);

    const encrypted = await encryptVaultData('MyBankPIN999', key1);

    await expect(
      decryptVaultData(encrypted.ciphertext, encrypted.iv, key2)
    ).rejects.toThrow(/integrity check failed/i);
  });
});
