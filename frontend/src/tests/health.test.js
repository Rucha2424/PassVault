import { describe, it, expect } from 'vitest';
import { calculateVaultHealth } from '../crypto/passwordAnalyzer';

describe('PassVault Health Analyzer', () => {
  it('returns 100% health for empty vault', () => {
    const health = calculateVaultHealth([]);
    expect(health.healthScore).toBe(100);
    expect(health.weakCount).toBe(0);
    expect(health.reusedCount).toBe(0);
  });

  it('detects weak and reused passwords across credentials', () => {
    const creds = [
      { _id: '1', title: 'Site A', password: '123' }, // weak, reused
      { _id: '2', title: 'Site B', password: '123' }, // weak, reused
      { _id: '3', title: 'Site C', password: 'V3ry$tr0ng!P@ssw0rd#2026' }, // strong, unique
    ];

    const health = calculateVaultHealth(creds);
    expect(health.weakCount).toBe(2);
    expect(health.reusedCount).toBe(2);
    expect(health.healthScore).toBeLessThan(70);
    expect(health.recommendations.length).toBeGreaterThan(0);
  });

  it('returns optimal score when all credentials are long and unique', () => {
    const creds = [
      { _id: '1', title: 'Site A', password: 'A8#dE9!kL2$mP5%qR8' },
      { _id: '2', title: 'Site B', password: 'Z1@bC4^fG7*jM0(vX3' },
      { _id: '3', title: 'Site C', password: 'Q9&wE3_tY7+uI1=oP5' },
    ];

    const health = calculateVaultHealth(creds);
    expect(health.weakCount).toBe(0);
    expect(health.reusedCount).toBe(0);
    expect(health.healthScore).toBe(100);
  });
});
