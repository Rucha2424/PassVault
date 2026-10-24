import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useToast } from '../context/ToastContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import FormInput from '../components/common/FormInput';
import PasswordInput from '../components/common/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const { setKeyAndUnlock } = useVault();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/vault';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!masterPassword) {
      newErrors.masterPassword = 'Master password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { user, vaultSalt } = await login(email, masterPassword);
      // Immediately derive the vault key from master password and user's vault salt
      if (vaultSalt) {
        await setKeyAndUnlock(masterPassword, vaultSalt);
      }
      addToast('Welcome back! Vault unlocked.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ general: err.message || 'Invalid email or master password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-soft-lavender text-ultra-violet mb-1 shadow-subtle">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-deep-plum tracking-tight">
              Unlock Your PassVault
            </h1>
            <p className="text-xs text-muted-text">
              Enter your credentials to decrypt your vault
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-vault-border rounded-xl shadow-card p-6 sm:p-8 space-y-5">
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-vault-error font-medium">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="developer@company.org"
                required
                icon={Mail}
                error={errors.email}
              />

              <PasswordInput
                label="Master Password"
                name="masterPassword"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  if (errors.masterPassword) setErrors((prev) => ({ ...prev, masterPassword: '' }));
                }}
                placeholder="Enter master password"
                required
                error={errors.masterPassword}
              />

              <PrimaryButton
                type="submit"
                loading={loading}
                fullWidth
                size="md"
                icon={ArrowRight}
              >
                Sign In & Unlock Vault
              </PrimaryButton>
            </form>

            <div className="pt-2 text-center text-xs text-muted-text border-t border-vault-border">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-ultra-violet hover:underline">
                Create a free vault
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
