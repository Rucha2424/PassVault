import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Copy,
  Lock,
  Unlock,
  KeyRound,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { useVault } from '../context/VaultContext';
import { calculateVaultHealth } from '../crypto/passwordAnalyzer';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import CredentialModal from '../components/vault/CredentialModal';
import UnlockVaultModal from '../components/common/UnlockVaultModal';

export default function HealthPage() {
  const {
    isUnlocked,
    credentials,
    loading,
    updateCredential,
    isUnlockModalOpen,
    setIsUnlockModalOpen,
  } = useVault();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'weak', 'reused', 'old'
  const [editingCred, setEditingCred] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const health = calculateVaultHealth(credentials);

  const handleUpdateCredential = async (data) => {
    if (editingCred) {
      await updateCredential(editingCred._id, data);
      setModalOpen(false);
      setEditingCred(null);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vault-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-soft-lavender text-xs font-semibold text-ultra-violet mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Local In-Browser Security Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-plum tracking-tight">
              Password Health Auditor
            </h1>
            <p className="text-xs sm:text-sm text-muted-text mt-1">
              Audits password strength, duplicates, and age entirely on your client machine.
            </p>
          </div>

          {!isUnlocked && (
            <PrimaryButton onClick={() => setIsUnlockModalOpen(true)} icon={Lock}>
              Unlock to Audit
            </PrimaryButton>
          )}
        </div>

        {!isUnlocked ? (
          <div className="p-8 rounded-xl bg-white border border-vault-border shadow-subtle text-center space-y-4 py-16">
            <div className="w-12 h-12 rounded-xl bg-soft-lavender text-ultra-violet mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-deep-plum">Vault is Locked</h3>
              <p className="text-xs text-muted-text">
                Password health metrics are evaluated strictly on decrypted credentials in client memory. Unlock your vault to run the security analysis.
              </p>
            </div>
            <PrimaryButton onClick={() => setIsUnlockModalOpen(true)} icon={Unlock}>
              Unlock Vault
            </PrimaryButton>
          </div>
        ) : (
          <>
            {/* Overview Score Card */}
            <div className="bg-white border border-vault-border rounded-2xl p-6 sm:p-8 shadow-subtle">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Score Dial */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-warm-ivory border border-vault-border">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="text-soft-lavender stroke-current"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className={`stroke-current transition-all duration-1000 ${
                          health.healthScore >= 80
                            ? 'text-vault-success'
                            : health.healthScore >= 50
                            ? 'text-vault-warning'
                            : 'text-vault-error'
                        }`}
                        strokeWidth="10"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * health.healthScore) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold text-deep-plum">
                        {health.healthScore}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-muted-text">
                        Health
                      </span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-semibold text-deep-plum">
                    {health.healthScore >= 80
                      ? 'Vault Security is Excellent'
                      : health.healthScore >= 50
                      ? 'Moderate Security Risk'
                      : 'Urgent Action Recommended'}
                  </p>
                </div>

                {/* Score Breakdown & Recommendations */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-base font-bold text-deep-plum">Audit Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-lg bg-red-50/60 border border-red-200">
                      <span className="text-xs font-semibold uppercase text-vault-error">Weak</span>
                      <p className="text-2xl font-extrabold text-deep-plum mt-1">{health.weakCount}</p>
                      <p className="text-[11px] text-muted-text">low entropy / short</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200">
                      <span className="text-xs font-semibold uppercase text-vault-warning">Reused</span>
                      <p className="text-2xl font-extrabold text-deep-plum mt-1">{health.reusedCount}</p>
                      <p className="text-[11px] text-muted-text">across multiple sites</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-warm-ivory border border-vault-border">
                      <span className="text-xs font-semibold uppercase text-muted-text">Old (&gt;90d)</span>
                      <p className="text-2xl font-extrabold text-deep-plum mt-1">{health.oldCredentialsCount}</p>
                      <p className="text-[11px] text-muted-text">not updated recently</p>
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-deep-plum">
                      Actionable Recommendations
                    </h4>
                    {health.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-warm-ivory border border-vault-border text-xs text-deep-plum"
                      >
                        <CheckCircle2 className="w-4 h-4 text-ultra-violet shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Tabs for Credentials */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-vault-border pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'all'
                      ? 'bg-ultra-violet text-white'
                      : 'bg-white text-deep-plum border border-vault-border hover:bg-warm-ivory'
                  }`}
                >
                  All ({credentials.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('weak')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'weak'
                      ? 'bg-vault-error text-white'
                      : 'bg-white text-deep-plum border border-vault-border hover:bg-warm-ivory'
                  }`}
                >
                  Weak Passwords ({health.weakCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reused')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'reused'
                      ? 'bg-vault-warning text-white'
                      : 'bg-white text-deep-plum border border-vault-border hover:bg-warm-ivory'
                  }`}
                >
                  Reused Passwords ({health.reusedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('old')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'old'
                      ? 'bg-deep-plum text-white'
                      : 'bg-white text-deep-plum border border-vault-border hover:bg-warm-ivory'
                  }`}
                >
                  Stale ({health.oldCredentialsCount})
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {(() => {
                  let list = [];
                  if (activeTab === 'weak') list = health.weakCredentials;
                  else if (activeTab === 'reused') list = health.reusedCredentials;
                  else if (activeTab === 'old') list = health.oldCredentials;
                  else list = credentials;

                  if (list.length === 0) {
                    return (
                      <div className="p-8 bg-white border border-vault-border rounded-xl text-center text-xs text-muted-text">
                        No credentials match this filter category.
                      </div>
                    );
                  }

                  return list.map((cred) => (
                    <div
                      key={cred._id}
                      className="bg-white border border-vault-border rounded-xl p-4 sm:p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-deep-plum">{cred.title}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-warm-ivory border border-vault-border text-muted-text">
                            {cred.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-text font-mono">
                          {cred.username || 'No username'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <SecondaryButton
                          size="sm"
                          onClick={() => {
                            setEditingCred(cred);
                            setModalOpen(true);
                          }}
                        >
                          Update Password
                        </SecondaryButton>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </main>

      <CredentialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCred(null);
        }}
        onSubmit={handleUpdateCredential}
        credential={editingCred}
        loading={loading}
      />

      <UnlockVaultModal
        isOpen={isUnlockModalOpen}
        onClose={() => setIsUnlockModalOpen(false)}
      />
    </div>
  );
}
