import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  KeyRound,
  Star,
  Activity,
  Plus,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { calculateVaultHealth } from '../crypto/passwordAnalyzer';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import CredentialRow from '../components/vault/CredentialRow';
import CredentialModal from '../components/vault/CredentialModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import UnlockVaultModal from '../components/common/UnlockVaultModal';
import { LoadingState } from '../components/common/LoadingState';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    isUnlocked,
    credentials,
    loading,
    addCredential,
    updateCredential,
    deleteCredential,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
    fetchCredentials,
  } = useVault();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, cred: null });

  useEffect(() => {
    if (isUnlocked && credentials.length === 0) {
      fetchCredentials();
    }
  }, [isUnlocked, credentials.length, fetchCredentials]);

  const health = calculateVaultHealth(credentials);
  const totalCreds = credentials.length;
  const favoriteCreds = credentials.filter((c) => c.isFavorite);
  const recentCreds = [...credentials]
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
    .slice(0, 5);

  const handleSaveCredential = async (data) => {
    if (editingCred) {
      await updateCredential(editingCred._id, data);
    } else {
      await addCredential(data);
    }
    setModalOpen(false);
    setEditingCred(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.cred) {
      await deleteCredential(deleteDialog.cred._id);
      setDeleteDialog({ isOpen: false, cred: null });
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-white border border-vault-border rounded-2xl p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-soft-lavender text-xs font-semibold text-ultra-violet">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Knowledge Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-plum tracking-tight">
              Welcome back, {user?.email?.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-muted-text">
              Here is your cloud password vault overview and security posture.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isUnlocked ? (
              <PrimaryButton
                onClick={() => {
                  setEditingCred(null);
                  setModalOpen(true);
                }}
                icon={Plus}
                size="md"
              >
                Add Credential
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => setIsUnlockModalOpen(true)}
                icon={Lock}
                size="md"
              >
                Unlock Vault
              </PrimaryButton>
            )}
            <Link to="/generator">
              <SecondaryButton size="md" icon={KeyRound}>
                Generator
              </SecondaryButton>
            </Link>
          </div>
        </div>

        {/* Locked Vault Notice */}
        {!isUnlocked && (
          <div className="p-4 rounded-xl bg-soft-apricot/20 border border-soft-apricot flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-soft-apricot text-deep-plum shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-deep-plum">Vault is currently locked</h4>
                <p className="text-xs text-muted-text">
                  Your encryption key was wiped from memory. Unlock with your master password to view credentials and metrics.
                </p>
              </div>
            </div>
            <PrimaryButton
              size="sm"
              onClick={() => setIsUnlockModalOpen(true)}
              className="shrink-0"
            >
              Unlock Now
            </PrimaryButton>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Credentials */}
          <div className="bg-white border border-vault-border rounded-xl p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Total Credentials
              </span>
              <div className="w-8 h-8 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-deep-plum">
                {isUnlocked ? totalCreds : '—'}
              </span>
              <span className="text-xs text-muted-text">stored items</span>
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white border border-vault-border rounded-xl p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Favorites
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-deep-plum">
                {isUnlocked ? favoriteCreds.length : '—'}
              </span>
              <span className="text-xs text-muted-text">starred</span>
            </div>
          </div>

          {/* Vault Health Score */}
          <div className="bg-white border border-vault-border rounded-xl p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Security Score
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-vault-success flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-deep-plum">
                {isUnlocked ? `${health.healthScore}%` : '—'}
              </span>
              <span className="text-xs text-vault-success font-semibold">
                {isUnlocked && (health.healthScore >= 80 ? 'Optimal' : health.healthScore >= 50 ? 'Fair' : 'Needs Action')}
              </span>
            </div>
          </div>

          {/* Password Health Alerts */}
          <div className="bg-white border border-vault-border rounded-xl p-5 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Vulnerabilities
              </span>
              <div className="w-8 h-8 rounded-lg bg-soft-apricot/40 text-deep-plum flex items-center justify-center">
                <Shield className="w-4 h-4 text-ultra-violet" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-deep-plum">
                {isUnlocked ? health.weakCount + health.reusedCount : '—'}
              </span>
              <span className="text-xs text-muted-text">
                {isUnlocked ? `${health.weakCount} weak, ${health.reusedCount} reused` : 'encrypted'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Recently Added / Updated Credentials (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-ultra-violet" />
                <h3 className="text-base font-bold text-deep-plum">Recent Credentials</h3>
              </div>
              <Link
                to="/vault"
                className="text-xs font-semibold text-ultra-violet hover:underline inline-flex items-center gap-1"
              >
                <span>View all ({totalCreds})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <LoadingState message="Decrypting recent credentials..." />
            ) : recentCreds.length === 0 ? (
              <div className="bg-white border border-vault-border rounded-xl p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet mx-auto flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-deep-plum">No credentials in vault yet</h4>
                <p className="text-xs text-muted-text max-w-sm mx-auto">
                  Protect your logins, API tokens, and notes with end-to-end AES-256-GCM encryption.
                </p>
                {isUnlocked && (
                  <PrimaryButton
                    size="sm"
                    onClick={() => {
                      setEditingCred(null);
                      setModalOpen(true);
                    }}
                  >
                    Add Your First Credential
                  </PrimaryButton>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentCreds.map((cred) => (
                  <CredentialRow
                    key={cred._id}
                    credential={cred}
                    onEdit={(c) => {
                      setEditingCred(c);
                      setModalOpen(true);
                    }}
                    onDelete={(c) => setDeleteDialog({ isOpen: true, cred: c })}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Security Recommendations & Quick Tools (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Password Health Card */}
            <div className="bg-white border border-vault-border rounded-xl p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-vault-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-ultra-violet" />
                  <h4 className="text-sm font-bold text-deep-plum">Vault Health</h4>
                </div>
                <Link
                  to="/health"
                  className="text-xs font-semibold text-ultra-violet hover:underline"
                >
                  Full Report
                </Link>
              </div>

              {isUnlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-text">Security Score</span>
                    <span className="font-bold text-deep-plum">{health.healthScore}%</span>
                  </div>
                  <div className="w-full bg-soft-lavender h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ultra-violet transition-all duration-500 rounded-full"
                      style={{ width: `${health.healthScore}%` }}
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    {health.recommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="text-xs text-muted-text flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-soft-apricot shrink-0 mt-1.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-text">Unlock vault to evaluate password health.</p>
              )}
            </div>

            {/* Quick Generator Box */}
            <div className="bg-soft-lavender/40 border border-vault-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ultra-violet" />
                <h4 className="text-sm font-bold text-deep-plum">Strong Password Generator</h4>
              </div>
              <p className="text-xs text-muted-text leading-relaxed">
                Generate high-entropy credentials with customizable characters and zero ambiguity.
              </p>
              <Link to="/generator" className="block pt-1">
                <SecondaryButton fullWidth size="sm" variant="white">
                  Open Generator
                </SecondaryButton>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CredentialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCred(null);
        }}
        onSubmit={handleSaveCredential}
        credential={editingCred}
        loading={loading}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Credential"
        message={`Are you sure you want to permanently delete "${deleteDialog.cred?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Credential"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, cred: null })}
        loading={loading}
      />

      <UnlockVaultModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />
    </div>
  );
}
