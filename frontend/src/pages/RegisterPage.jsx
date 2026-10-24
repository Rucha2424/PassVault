import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useVault } from '../context/VaultContext';
import { useToast } from '../context/ToastContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import FormInput from '../components/common/FormInput';
import PasswordInput from '../components/common/PasswordInput';

export default function RegisterPage() {
  const { register } = useAuth();
  const { setKeyAndUnlock } = useVault();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!masterPassword || masterPassword.length < 8) {
      newErrors.masterPassword = 'Master password must be at least 8 characters';
    }
    if (masterPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { vaultSalt } = await register(email, masterPassword);
      // Immediately derive vault key and unlock vault in memory
      await setKeyAndUnlock(masterPassword, vaultSalt);
      addToast('Account created and vault initialized successfully!', 'success');
      navigate('/vault');
    } catch (err) {
      setErrors({ general: err.message || 'Registration failed' });
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
              Create Your Secure Vault
            </h1>
            <p className="text-xs text-muted-text">
              Zero-knowledge encryption protects your digital life
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
                placeholder="At least 8 strong characters"
                required
                showStrength
                error={errors.masterPassword}
              />

              <PasswordInput
                label="Confirm Master Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                placeholder="Re-enter your master password"
                required
                error={errors.confirmPassword}
              />

              {/* Encryption Notice */}
              <div className="p-3 rounded-lg bg-soft-lavender/50 border border-vault-border flex items-start gap-2.5">
                <Info className="w-4 h-4 text-ultra-violet shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-text leading-relaxed">
                  <strong className="text-deep-plum">Important:</strong> Your Master Password is used to derive your AES-256 vault decryption key. It is never transmitted to or stored on our servers.
                </p>
              </div>

              <PrimaryButton
                type="submit"
                loading={loading}
                fullWidth
                size="md"
                icon={ArrowRight}
              >
                Create PassVault Account
              </PrimaryButton>
            </form>

            <div className="pt-2 text-center text-xs text-muted-text border-t border-vault-border">
              Already have a vault?{' '}
              <Link to="/login" className="font-semibold text-ultra-violet hover:underline">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
