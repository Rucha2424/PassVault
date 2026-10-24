import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import {
  deriveVaultKey,
  encryptVaultData,
  decryptVaultData,
} from '../crypto/vaultCrypto';

const VaultContext = createContext(null);

export const VaultProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [vaultKey, setVaultKey] = useState(null); // In-memory CryptoKey only
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

  // Auto-lock inactivity timer
  const autoLockTimerRef = useRef(null);
  const autoLockMinutes = user?.settings?.autoLockTimeout ?? 15;

  const lockVault = useCallback(() => {
    setVaultKey(null);
    setIsUnlocked(false);
    setCredentials([]);
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }
  }, []);

  // Reset auto lock timer on user activity
  const resetAutoLockTimer = useCallback(() => {
    if (autoLockTimerRef.current) {
      clearTimeout(autoLockTimerRef.current);
    }
    if (autoLockMinutes > 0 && isUnlocked) {
      autoLockTimerRef.current = setTimeout(() => {
        lockVault();
        addToast('Vault locked due to inactivity.', 'warning');
      }, autoLockMinutes * 60 * 1000);
    }
  }, [autoLockMinutes, isUnlocked, lockVault, addToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      lockVault();
    }
  }, [isAuthenticated, lockVault]);

  useEffect(() => {
    if (!isUnlocked) return;

    const handleActivity = () => resetAutoLockTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    resetAutoLockTimer();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (autoLockTimerRef.current) {
        clearTimeout(autoLockTimerRef.current);
      }
    };
  }, [isUnlocked, resetAutoLockTimer]);

  /**
   * Decrypt a list of raw backend credentials with the given CryptoKey
   */
  const decryptCredentialsList = useCallback(async (rawList, key) => {
    const decryptedList = await Promise.all(
      rawList.map(async (item) => {
        let password = '';
        let notes = '';

        try {
          if (item.encryptedPassword && item.passwordIv) {
            password = await decryptVaultData(item.encryptedPassword, item.passwordIv, key);
          }
        } catch {
          password = '[Decryption error - data tampered or invalid key]';
        }

        try {
          if (item.encryptedNotes && item.notesIv) {
            notes = await decryptVaultData(item.encryptedNotes, item.notesIv, key);
          }
        } catch {
          notes = '';
        }

        return {
          ...item,
          password,
          notes,
        };
      })
    );
    return decryptedList;
  }, []);

  /**
   * Unlock vault using master password
   */
  const unlockVault = async (masterPassword) => {
    if (!user || !user.vaultSalt) {
      throw new Error('User vault salt not available');
    }

    setLoading(true);
    try {
      const derivedKey = await deriveVaultKey(masterPassword, user.vaultSalt);

      // Fetch raw credentials from backend
      const res = await api.get('/credentials');
      const rawList = res.data.credentials || [];

      // Test decrypt if credentials exist
      if (rawList.length > 0 && rawList[0].encryptedPassword) {
        try {
          await decryptVaultData(rawList[0].encryptedPassword, rawList[0].passwordIv, derivedKey);
        } catch {
          throw new Error('Incorrect master password');
        }
      }

      const decrypted = await decryptCredentialsList(rawList, derivedKey);
      setVaultKey(derivedKey);
      setCredentials(decrypted);
      setIsUnlocked(true);
      setIsUnlockModalOpen(false);
      return true;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set key directly (e.g. immediately upon login or registration)
   */
  const setKeyAndUnlock = async (masterPassword, salt) => {
    setLoading(true);
    try {
      const derivedKey = await deriveVaultKey(masterPassword, salt);
      setVaultKey(derivedKey);
      setIsUnlocked(true);

      const res = await api.get('/credentials');
      const rawList = res.data.credentials || [];
      const decrypted = await decryptCredentialsList(rawList, derivedKey);
      setCredentials(decrypted);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch credentials from backend and decrypt
   */
  const fetchCredentials = useCallback(async () => {
    if (!vaultKey) return;
    setLoading(true);
    try {
      const res = await api.get('/credentials');
      const rawList = res.data.credentials || [];
      const decrypted = await decryptCredentialsList(rawList, vaultKey);
      setCredentials(decrypted);
    } finally {
      setLoading(false);
    }
  }, [vaultKey, decryptCredentialsList]);

  /**
   * Add a new credential
   */
  const addCredential = async (data) => {
    if (!vaultKey) {
      throw new Error('Vault is locked. Unlock to perform this action.');
    }

    // Encrypt password
    const encryptedPwObj = await encryptVaultData(data.password || '', vaultKey);
    // Encrypt notes
    const encryptedNotesObj = await encryptVaultData(data.notes || '', vaultKey);

    const payload = {
      title: data.title,
      url: data.url || '',
      username: data.username || '',
      category: data.category || 'Logins',
      isFavorite: !!data.isFavorite,
      encryptedPassword: encryptedPwObj.ciphertext,
      passwordIv: encryptedPwObj.iv,
      encryptedNotes: encryptedNotesObj.ciphertext,
      notesIv: encryptedNotesObj.iv,
    };

    const res = await api.post('/credentials', payload);
    const newCred = {
      ...res.data.credential,
      password: data.password || '',
      notes: data.notes || '',
    };

    setCredentials((prev) => [newCred, ...prev]);
    return newCred;
  };

  /**
   * Update existing credential
   */
  const updateCredential = async (id, data) => {
    if (!vaultKey) {
      throw new Error('Vault is locked. Unlock to perform this action.');
    }

    const encryptedPwObj = await encryptVaultData(data.password || '', vaultKey);
    const encryptedNotesObj = await encryptVaultData(data.notes || '', vaultKey);

    const payload = {
      title: data.title,
      url: data.url || '',
      username: data.username || '',
      category: data.category || 'Logins',
      isFavorite: !!data.isFavorite,
      encryptedPassword: encryptedPwObj.ciphertext,
      passwordIv: encryptedPwObj.iv,
      encryptedNotes: encryptedNotesObj.ciphertext,
      notesIv: encryptedNotesObj.iv,
    };

    const res = await api.put(`/credentials/${id}`, payload);
    const updated = {
      ...res.data.credential,
      password: data.password || '',
      notes: data.notes || '',
    };

    setCredentials((prev) =>
      prev.map((c) => (c._id === id ? updated : c))
    );
    return updated;
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (id) => {
    const cred = credentials.find((c) => c._id === id);
    if (!cred) return;

    const newFav = !cred.isFavorite;
    // Optimistic update
    setCredentials((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isFavorite: newFav } : c))
    );

    try {
      await api.put(`/credentials/${id}`, { isFavorite: newFav });
    } catch (err) {
      // Revert on error
      setCredentials((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isFavorite: !newFav } : c))
      );
      throw err;
    }
  };

  /**
   * Delete credential
   */
  const deleteCredential = async (id) => {
    await api.delete(`/credentials/${id}`);
    setCredentials((prev) => prev.filter((c) => c._id !== id));
  };

  /**
   * Secure copy to clipboard with auto-clear after 30 seconds
   */
  const copyToClipboard = async (text, label = 'Password') => {
    try {
      await navigator.clipboard.writeText(text);
      addToast(`${label} copied! Clipboard will clear in 30s.`, 'success');

      // Schedule clipboard clear
      setTimeout(async () => {
        try {
          const current = await navigator.clipboard.readText();
          if (current === text) {
            await navigator.clipboard.writeText('');
          }
        } catch {
          // Clipboard read may be blocked by browser permissions, ignore
        }
      }, 30000);
    } catch {
      addToast('Failed to copy to clipboard', 'error');
    }
  };

  const value = {
    isUnlocked,
    vaultKey,
    credentials,
    loading,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    unlockVault,
    lockVault,
    setKeyAndUnlock,
    fetchCredentials,
    addCredential,
    updateCredential,
    deleteCredential,
    toggleFavorite,
    copyToClipboard,
  };

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
