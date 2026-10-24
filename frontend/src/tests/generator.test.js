import { describe, it, expect } from 'vitest';
import {
  generateSecurePassword,
  analyzePassword,
  calculateVaultHealth,
} from '../crypto/passwordAnalyzer';

describe('PassVault Password Generator & Entropy Analyzer', () => {
  it('generates a password with exact requested length', () => {
    const p1 = generateSecurePassword({ length: 12 });
    const p2 = generateSecurePassword({ length: 24 });
    const p3 = generateSecurePassword({ length: 32 });

    expect(p1.length).toBe(12);
    expect(p2.length).toBe(24);
    expect(p3.length).toBe(32);
  });

  it('guarantees inclusion of selected character sets', () => {
    const pw = generateSecurePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });

    expect(/[A-Z]/.test(pw)).toBe(true);
    expect(/[a-z]/.test(pw)).toBe(true);
    expect(/[0-9]/.test(pw)).toBe(true);
    expect(/[^A-Za-z0-9]/.test(pw)).toBe(true);
  });

  it('excludes ambiguous characters when avoidAmbiguous is true', () => {
    // Generate multiple passwords to ensure no ambiguous characters appear
    for (let i = 0; i < 15; i++) {
      const pw = generateSecurePassword({
        length: 25,
        avoidAmbiguous: true,
      });
      expect(/[0Oo1lI|]/.test(pw)).toBe(false);
    }
  });

  it('accurately rates weak vs strong passwords', () => {
    const weak = analyzePassword('pass1');
    expect(weak.isWeak).toBe(true);
    expect(weak.score).toBeLessThanOrEqual(1);

    const strong = analyzePassword('K8#vL9$mP2!qR5*z');
    expect(strong.isWeak).toBe(false);
    expect(strong.score).toBeGreaterThanOrEqual(3);
  });
});
