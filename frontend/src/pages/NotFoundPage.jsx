import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-vault-border rounded-2xl p-8 shadow-card text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-soft-lavender text-ultra-violet mx-auto flex items-center justify-center shadow-subtle">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-ultra-violet bg-soft-lavender px-2.5 py-0.5 rounded">
              Error 404
            </span>
            <h1 className="text-2xl font-extrabold text-deep-plum tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
              The encrypted path you requested does not exist or has been relocated.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to={isAuthenticated ? '/vault' : '/'}>
              <PrimaryButton icon={Home}>
                {isAuthenticated ? 'Return to Vault' : 'Back to Home'}
              </PrimaryButton>
            </Link>
            <Link to="/generator">
              <SecondaryButton icon={KeyRound}>
                Password Generator
              </SecondaryButton>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
