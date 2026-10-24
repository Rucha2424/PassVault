import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import DestructiveButton from './DestructiveButton';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-plum/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-vault-border rounded-xl shadow-elevated max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-lg shrink-0 ${isDestructive ? 'bg-red-50 text-vault-error' : 'bg-soft-lavender text-ultra-violet'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-deep-plum">{title}</h3>
            <p className="mt-1 text-sm text-muted-text leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-vault-border">
          <SecondaryButton onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </SecondaryButton>
          {isDestructive ? (
            <DestructiveButton onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </DestructiveButton>
          ) : (
            <PrimaryButton onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
