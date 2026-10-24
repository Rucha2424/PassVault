import '@testing-library/jest-dom';
import { webcrypto } from 'node:crypto';

// Ensure Web Crypto API is available in test environment
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
if (!globalThis.crypto.subtle && webcrypto.subtle) {
  globalThis.crypto.subtle = webcrypto.subtle;
}
