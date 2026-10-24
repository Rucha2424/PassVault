import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  Trash2,
  LogOut,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { AUTO_LOCK_OPTIONS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useToast } from '../context/ToastContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import DestructiveButton from '../components/common/DestructiveButton';
import PasswordInput from '../components/common/PasswordInput';

export default function SettingsPage() {
  const { user, updateSettings, deleteAccount, logout } = useAuth();
  const { lockVault } = useVault();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [autoLockTimeout, setAutoLockTimeout] = useState(
    user?.settings?.autoLockTimeout ?? 15
  );
  const [savingTimeout, setSavingTimeout] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSaveTimeout = async () => {
    setSavingTimeout(true);
    try {
      await updateSettings({ autoLockTimeout: Number(autoLockTimeout) });
      addToast('Auto-lock timeout updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingTimeout(false);
    }
  };

  const handleLogout = async () => {
    lockVault();
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError('Master password is required to confirm account deletion.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount(deletePassword);
      lockVault();
      addToast('Account and encrypted vault data permanently deleted.', 'info');
      navigate('/register');
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="pb-4 border-b border-vault-border">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-plum tracking-tight">
            Vault Settings
          </h1>
          <p className="text-xs sm:text-sm text-muted-text mt-1">
            Manage your account preferences, memory security timeouts, and data policies.
          </p>
        </div>

        {/* Section 1: Account Information */}
        <div className="bg-white border border-vault-border rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-vault-border">
            <div className="w-8 h-8 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-deep-plum">Account Profile</h3>
              <p className="text-xs text-muted-text">Your PassVault registration details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-text">Email Address:</span>
              <p className="font-bold text-deep-plum mt-0.5">{user?.email}</p>
            </div>
            <div>
              <span className="text-muted-text">Zero-Knowledge Vault Salt:</span>
              <p className="font-mono text-deep-plum mt-0.5 truncate max-w-xs">
                {user?.vaultSalt ? `${user.vaultSalt.substring(0, 16)}...` : 'Configured'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Vault Auto-Lock Timeout */}
        <div className="bg-white border border-vault-border rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-vault-border">
            <div className="w-8 h-8 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-deep-plum">Inactivity Safeguard</h3>
              <p className="text-xs text-muted-text">
                Automatically purge your AES-256 decryption key from client memory when idle
              </p>
            </div>
          </div>

          <div className="space-y-3 max-w-md">
            <label className="block text-xs font-semibold uppercase tracking-wider text-deep-plum">
              Auto-Lock Timeout
            </label>
            <select
              value={autoLockTimeout}
              onChange={(e) => setAutoLockTimeout(Number(e.target.value))}
              className="w-full rounded-lg border border-vault-border bg-white text-sm text-deep-plum px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet"
            >
              {AUTO_LOCK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-text">
              When triggered, your stored credentials will require your Master Password again to view.
            </p>

            <PrimaryButton
              size="sm"
              onClick={handleSaveTimeout}
              loading={savingTimeout}
            >
              Save Timeout Preference
            </PrimaryButton>
          </div>
        </div>

        {/* Section 3: Session Management & Manual Lock */}
        <div className="bg-white border border-vault-border rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-vault-border">
            <div className="w-8 h-8 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-deep-plum">Session Security</h3>
              <p className="text-xs text-muted-text">Lock your memory vault or end your session</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <SecondaryButton
              onClick={() => {
                lockVault();
                addToast('Vault locked. Credentials cleared from memory.', 'info');
              }}
              icon={Lock}
            >
              Lock Vault Now
            </SecondaryButton>
            <SecondaryButton
              onClick={handleLogout}
              icon={LogOut}
              className="text-vault-error"
            >
              Log Out of PassVault
            </SecondaryButton>
          </div>
        </div>

        {/* Section 4: Danger Zone - Account Deletion */}
        <div className="bg-white border border-red-200 rounded-xl p-6 shadow-subtle space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-red-100">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-vault-error flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-vault-error">Danger Zone</h3>
              <p className="text-xs text-muted-text">Permanently delete your account and all encrypted credentials</p>
            </div>
          </div>

          <p className="text-xs text-muted-text leading-relaxed">
            Deleting your account will immediately wipe your user record and all associated encrypted credentials from the database. This action is irreversible.
          </p>

          <DestructiveButton
            onClick={() => setDeleteModalOpen(true)}
            size="sm"
          >
            Delete PassVault Account
          </DestructiveButton>
        </div>
      </main>

      {/* Account Deletion Confirmation Dialog */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-plum/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-vault-border rounded-xl shadow-elevated max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-red-50 text-vault-error shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-deep-plum">Confirm Account Deletion</h3>
                <p className="mt-1 text-xs text-muted-text leading-relaxed">
                  Please enter your Master Password to verify your identity and delete your account and all credentials permanently.
                </p>
              </div>
            </div>

            <PasswordInput
              label="Master Password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Confirm master password"
              error={deleteError}
              required
            />

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-vault-border">
              <SecondaryButton
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeletePassword('');
                  setDeleteError('');
                }}
                disabled={deleting}
              >
                Cancel
              </SecondaryButton>
              <DestructiveButton
                onClick={handleDeleteAccount}
                loading={deleting}
              >
                Permanently Delete
              </DestructiveButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
