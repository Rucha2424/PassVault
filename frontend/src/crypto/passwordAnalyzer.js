/**
 * PassVault Password Generator and Health Analyzer
 * Uses window.crypto.getRandomValues for cryptographically secure randomness.
 */

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Ambiguous characters: 0, O, o, 1, l, I, |
const AMBIGUOUS_REGEX = /[0Oo1lI|]/g;

/**
 * Cryptographically secure integer generator in range [0, max - 1]
 * Uses rejection sampling to eliminate modulo bias.
 */
const getSecureRandomInt = (max) => {
  if (max <= 0) return 0;
  const cryptoObj = typeof window !== 'undefined' && window.crypto ? window.crypto : globalThis.crypto;
  const uint32 = new Uint32Array(1);
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  let rand;
  do {
    cryptoObj.getRandomValues(uint32);
    rand = uint32[0];
  } while (rand >= limit);

  return rand % max;
};

/**
 * Generate cryptographically secure password
 */
export const generateSecurePassword = ({
  length = 16,
  uppercase = true,
  lowercase = true,
  numbers = true,
  symbols = true,
  avoidAmbiguous = false,
} = {}) => {
  let upperPool = UPPERCASE;
  let lowerPool = LOWERCASE;
  let numPool = NUMBERS;
  let symPool = SYMBOLS;

  if (avoidAmbiguous) {
    upperPool = upperPool.replace(AMBIGUOUS_REGEX, '');
    lowerPool = lowerPool.replace(AMBIGUOUS_REGEX, '');
    numPool = numPool.replace(AMBIGUOUS_REGEX, '');
    symPool = symPool.replace(AMBIGUOUS_REGEX, '');
  }

  const pools = [];
  if (uppercase && upperPool) pools.push(upperPool);
  if (lowercase && lowerPool) pools.push(lowerPool);
  if (numbers && numPool) pools.push(numPool);
  if (symbols && symPool) pools.push(symPool);

  // Fallback if none selected
  if (pools.length === 0) {
    pools.push(lowerPool || LOWERCASE);
  }

  const resultChars = [];

  // Guarantee at least one character from each selected pool
  pools.forEach((pool) => {
    const idx = getSecureRandomInt(pool.length);
    resultChars.push(pool[idx]);
  });

  // Combine all allowed characters into one pool
  const allChars = pools.join('');

  // Fill remainder of the requested length
  while (resultChars.length < length) {
    const idx = getSecureRandomInt(allChars.length);
    resultChars.push(allChars[idx]);
  }

  // Shuffle using Fisher-Yates with crypto.getRandomValues
  for (let i = resultChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = resultChars[i];
    resultChars[i] = resultChars[j];
    resultChars[j] = temp;
  }

  return resultChars.slice(0, length).join('');
};

/**
 * Calculate password strength and entropy
 */
export const analyzePassword = (password = '') => {
  if (!password) {
    return {
      score: 0,
      label: 'None',
      color: 'vault-border',
      entropy: 0,
      feedback: 'Enter a password to evaluate strength.',
      isWeak: true,
    };
  }

  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);

  let poolSize = 0;
  if (hasUpper) poolSize += 26;
  if (hasLower) poolSize += 26;
  if (hasNum) poolSize += 10;
  if (hasSym) poolSize += 32;

  const entropy = Math.round(length * Math.log2(Math.max(poolSize, 2)));

  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (hasUpper && hasLower) score += 1;
  if (hasNum && hasSym) score += 1;

  // Normalize score between 0 and 4
  const normalizedScore = Math.min(Math.floor(score * 0.8), 4);

  const STRENGTH_CONFIG = [
    { label: 'Very Weak', color: '#C43D57', isWeak: true },
    { label: 'Weak', color: '#B76A20', isWeak: true },
    { label: 'Fair', color: '#D99824', isWeak: true },
    { label: 'Strong', color: '#24856B', isWeak: false },
    { label: 'Very Strong', color: '#6C3CE9', isWeak: false },
  ];

  const config = STRENGTH_CONFIG[normalizedScore];

  let feedback = '';
  if (length < 12) {
    feedback = 'Use at least 12 characters for better protection.';
  } else if (!hasSym || !hasNum) {
    feedback = 'Add numbers or special symbols to increase complexity.';
  } else if (!hasUpper || !hasLower) {
    feedback = 'Mix uppercase and lowercase letters.';
  } else {
    feedback = 'Excellent password complexity and length.';
  }

  return {
    score: normalizedScore,
    label: config.label,
    color: config.color,
    entropy,
    feedback,
    isWeak: config.isWeak,
    length,
    hasUpper,
    hasLower,
    hasNum,
    hasSym,
  };
};

/**
 * Analyze overall health of all decrypted vault credentials
 */
export const calculateVaultHealth = (decryptedCredentials = []) => {
  if (!decryptedCredentials || decryptedCredentials.length === 0) {
    return {
      healthScore: 100,
      totalCredentials: 0,
      weakCount: 0,
      reusedCount: 0,
      oldCredentialsCount: 0,
      reusedMap: {},
      weakCredentials: [],
      reusedCredentials: [],
      oldCredentials: [],
      recommendations: ['Add credentials to your vault to monitor your security health.'],
    };
  }

  const passwordUsageMap = new Map();
  const weakCredentials = [];
  const oldCredentials = [];
  const now = new Date();
  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

  decryptedCredentials.forEach((cred) => {
    const pw = cred.password || '';
    const analysis = analyzePassword(pw);

    if (analysis.isWeak) {
      weakCredentials.push({ ...cred, analysis });
    }

    if (pw) {
      if (!passwordUsageMap.has(pw)) {
        passwordUsageMap.set(pw, []);
      }
      passwordUsageMap.get(pw).push(cred);
    }

    if (cred.updatedAt) {
      const updatedDate = new Date(cred.updatedAt);
      if (now - updatedDate > NINETY_DAYS_MS) {
        oldCredentials.push(cred);
      }
    }
  });

  // Calculate reused
  const reusedCredentials = [];
  const reusedMap = {};
  passwordUsageMap.forEach((creds, pw) => {
    if (creds.length > 1) {
      reusedMap[pw] = creds;
      creds.forEach((c) => {
        if (!reusedCredentials.some((existing) => existing._id === c._id)) {
          reusedCredentials.push(c);
        }
      });
    }
  });

  const total = decryptedCredentials.length;
  const weakCount = weakCredentials.length;
  const reusedCount = reusedCredentials.length;
  const oldCount = oldCredentials.length;

  // Health score calculation (0 - 100)
  // Deduct points for weak passwords, reused passwords, and old credentials
  let score = 100;
  if (total > 0) {
    const weakPenalty = (weakCount / total) * 45;
    const reusedPenalty = (reusedCount / total) * 40;
    const oldPenalty = (oldCount / total) * 15;
    score = Math.max(0, Math.round(100 - weakPenalty - reusedPenalty - oldPenalty));
  }

  const recommendations = [];
  if (weakCount > 0) {
    recommendations.push(`Update ${weakCount} weak ${weakCount === 1 ? 'password' : 'passwords'} with generated 16+ character credentials.`);
  }
  if (reusedCount > 0) {
    recommendations.push(`Eliminate ${reusedCount} reused ${reusedCount === 1 ? 'credential' : 'credentials'} to prevent credential-stuffing attacks.`);
  }
  if (oldCount > 0) {
    recommendations.push(`Review ${oldCount} credentials not updated in over 90 days.`);
  }
  if (recommendations.length === 0) {
    recommendations.push('Your password vault is in excellent shape! All credentials are strong and unique.');
  }

  return {
    healthScore: score,
    totalCredentials: total,
    weakCount,
    reusedCount,
    oldCredentialsCount: oldCount,
    reusedMap,
    weakCredentials,
    reusedCredentials,
    oldCredentials,
    recommendations,
  };
};
