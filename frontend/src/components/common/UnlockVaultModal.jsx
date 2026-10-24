import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import { useToast } from '../../context/ToastContext';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import PasswordInput from './PasswordInput';

export default function UnlockVaultModal({ isOpen, onClose }) {
  const { unlockVault } = useVault();
  const { addToast } = useToast();
  const [masterPassword, setMasterPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!masterPassword) {
      setError('Master password is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await unlockVault(masterPassword);
      addToast('Vault successfully unlocked', 'success');
      setMasterPassword('');
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Incorrect master password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-plum/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-vault-border rounded-xl shadow-elevated max-w-md w-full p-6 space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-soft-lavender text-ultra-violet shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-deep-plum">Unlock Your Vault</h3>
            <p className="mt-1 text-xs text-muted-text leading-relaxed">
              Enter your master password to decrypt your credentials in memory. Your key never leaves your browser.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            label="Master Password"
            value={masterPassword}
            onChange={(e) => {
              setMasterPassword(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter master password"
            required
            autoFocus
            error={error}
          />

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-text">
              <ShieldCheck className="w-3.5 h-3.5 text-vault-success" />
              <span>AES-256-GCM Zero Knowledge</span>
            </div>

            <div className="flex items-center gap-2">
              {onClose && (
                <SecondaryButton onClick={onClose} disabled={loading} size="sm">
                  Cancel
                </SecondaryButton>
              )}
              <PrimaryButton type="submit" loading={loading} size="sm">
                Unlock Vault
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
