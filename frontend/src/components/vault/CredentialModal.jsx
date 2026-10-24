import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, User, Tag, FileText, Star, X } from 'lucide-react';
import { CATEGORIES } from '../../constants/theme';
import { generateSecurePassword } from '../../crypto/passwordAnalyzer';
import PrimaryButton from '../common/PrimaryButton';
import SecondaryButton from '../common/SecondaryButton';
import FormInput from '../common/FormInput';
import PasswordInput from '../common/PasswordInput';
import IconButton from '../common/IconButton';

export default function CredentialModal({
  isOpen,
  onClose,
  onSubmit,
  credential = null,
  loading = false,
}) {
  const isEditing = !!credential;

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    username: '',
    password: '',
    notes: '',
    category: 'Logins',
    isFavorite: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (credential) {
      setFormData({
        title: credential.title || '',
        url: credential.url || '',
        username: credential.username || '',
        password: credential.password || '',
        notes: credential.notes || '',
        category: credential.category || 'Logins',
        isFavorite: !!credential.isFavorite,
      });
    } else {
      setFormData({
        title: '',
        url: '',
        username: '',
        password: '',
        notes: '',
        category: 'Logins',
        isFavorite: false,
      });
    }
    setErrors({});
  }, [credential, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleGeneratePassword = () => {
    const generated = generateSecurePassword({
      length: 18,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    setFormData((prev) => ({ ...prev, password: generated }));
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password or secret is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-plum/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white border border-vault-border rounded-xl shadow-elevated max-w-lg w-full p-6 my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-vault-border">
          <div>
            <h3 className="text-lg font-bold text-deep-plum">
              {isEditing ? 'Edit Credential' : 'Add New Credential'}
            </h3>
            <p className="text-xs text-muted-text mt-0.5">
              Encrypted end-to-end with AES-256-GCM before saving.
            </p>
          </div>
          <IconButton
            icon={X}
            onClick={onClose}
            title="Close"
            variant="ghost"
            size="sm"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. GitHub, Google, AWS Console"
            required
            error={errors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Website URL"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://example.com"
              icon={Globe}
            />

            <div>
              <label
                htmlFor="category"
                className="block text-xs font-semibold uppercase tracking-wider text-deep-plum mb-1.5"
              >
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white border border-vault-border text-sm text-deep-plum h-10 px-3 focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <FormInput
            label="Username or Email"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="user@example.com"
            icon={User}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-deep-plum">
                Password or Secret <span className="text-vault-error">*</span>
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs text-ultra-violet font-semibold hover:text-ultra-violet-hover"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Strong</span>
              </button>
            </div>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter or generate secret"
              required
              showStrength
              error={errors.password}
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-semibold uppercase tracking-wider text-deep-plum mb-1.5"
            >
              Secure Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Recovery codes, PIN, security questions (encrypted client-side)"
              className="w-full rounded-lg bg-white border border-vault-border text-sm text-deep-plum p-3 focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet placeholder:text-muted-text/60"
            />
          </div>

          {/* Favorite toggle */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-deep-plum cursor-pointer select-none">
              <input
                type="checkbox"
                name="isFavorite"
                checked={formData.isFavorite}
                onChange={handleChange}
                className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
              />
              <span className="flex items-center gap-1.5">
                <Star className={`w-3.5 h-3.5 ${formData.isFavorite ? 'text-amber-500 fill-amber-500' : 'text-muted-text'}`} />
                Mark as Favorite
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-vault-border">
            <SecondaryButton onClick={onClose} disabled={loading}>
              Cancel
            </SecondaryButton>
            <PrimaryButton type="submit" loading={loading}>
              {isEditing ? 'Save Changes' : 'Save Credential'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
