import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  ArrowUpDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { CATEGORIES } from '../constants/theme';
import { useVault } from '../context/VaultContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import CredentialRow from '../components/vault/CredentialRow';
import CredentialModal from '../components/vault/CredentialModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import UnlockVaultModal from '../components/common/UnlockVaultModal';
import { LoadingState, EmptyState } from '../components/common/LoadingState';

export default function VaultPage() {
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('updatedAt-desc'); // 'title-asc', 'title-desc', 'updatedAt-desc', 'favorites'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, cred: null });

  useEffect(() => {
    if (isUnlocked && credentials.length === 0) {
      fetchCredentials();
    }
  }, [isUnlocked, credentials.length, fetchCredentials]);

  // Filter and sort credentials
  const filteredCredentials = useMemo(() => {
    return credentials
      .filter((cred) => {
        const matchesCategory =
          selectedCategory === 'All' || cred.category === selectedCategory;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          cred.title?.toLowerCase().includes(q) ||
          cred.username?.toLowerCase().includes(q) ||
          cred.url?.toLowerCase().includes(q) ||
          cred.notes?.toLowerCase().includes(q);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'favorites') {
          if (a.isFavorite === b.isFavorite) {
            return (a.title || '').localeCompare(b.title || '');
          }
          return a.isFavorite ? -1 : 1;
        }
        if (sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (sortBy === 'title-desc') {
          return (b.title || '').localeCompare(a.title || '');
        }
        if (sortBy === 'updatedAt-desc') {
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        }
        if (sortBy === 'updatedAt-asc') {
          return new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0);
        }
        return 0;
      });
  }, [credentials, searchQuery, selectedCategory, sortBy]);

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-vault-border">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-deep-plum tracking-tight">
              Password Vault
            </h1>
            <p className="text-xs sm:text-sm text-muted-text mt-1">
              Organize, search, and manage your encrypted credentials with zero-knowledge privacy.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
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
          </div>
        </div>

        {/* Vault Locked Alert */}
        {!isUnlocked && (
          <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle text-center space-y-4 py-12">
            <div className="w-12 h-12 rounded-xl bg-soft-lavender text-ultra-violet mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-deep-plum">Your Vault is Locked</h3>
              <p className="text-xs text-muted-text">
                Your credentials are encrypted with AES-256-GCM. Please enter your master password to decrypt and display your items.
              </p>
            </div>
            <PrimaryButton onClick={() => setIsUnlockModalOpen(true)} icon={Unlock}>
              Unlock With Master Password
            </PrimaryButton>
          </div>
        )}

        {/* Filter and Search Controls (Visible when unlocked) */}
        {isUnlocked && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-vault-border shadow-subtle">
              {/* Search Bar */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, username, url or notes..."
                  className="w-full pl-9 pr-4 py-2 text-sm text-deep-plum rounded-lg border border-vault-border bg-warm-ivory/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet transition-colors"
                />
              </div>

              {/* Sorting and Quick Category Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-text shrink-0">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>Sort:</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-vault-border bg-white text-xs font-medium text-deep-plum px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet"
                >
                  <option value="updatedAt-desc">Recently Updated</option>
                  <option value="updatedAt-asc">Oldest First</option>
                  <option value="title-asc">Title (A to Z)</option>
                  <option value="title-desc">Title (Z to A)</option>
                  <option value="favorites">Favorites First</option>
                </select>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const count =
                  cat === 'All'
                    ? credentials.length
                    : credentials.filter((c) => c.category === cat).length;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 flex items-center gap-1.5
                      ${
                        isSelected
                          ? 'bg-ultra-violet text-white shadow-subtle'
                          : 'bg-white text-deep-plum border border-vault-border hover:bg-warm-ivory'
                      }
                    `}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-soft-lavender text-deep-violet'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Credentials List */}
            {loading ? (
              <LoadingState message="Fetching and decrypting vault items..." />
            ) : filteredCredentials.length === 0 ? (
              <EmptyState
                title={
                  searchQuery || selectedCategory !== 'All'
                    ? 'No matching credentials found'
                    : 'Your vault is empty'
                }
                description={
                  searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search terms or selecting another category.'
                    : 'Add your first login, credit card or secure note to protect it in your vault.'
                }
                actionLabel="Add Credential"
                onAction={() => {
                  setEditingCred(null);
                  setModalOpen(true);
                }}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-text px-1">
                  <span>
                    Showing {filteredCredentials.length} of {credentials.length} credentials
                  </span>
                </div>
                {filteredCredentials.map((cred) => (
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
          </>
        )}
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
        message={`Are you sure you want to permanently delete "${deleteDialog.cred?.title}"? This item cannot be recovered.`}
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
