import React from 'react';
import { ShieldAlert, Inbox, Loader2 } from 'lucide-react';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export function LoadingState({ message = 'Loading vault credentials...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-soft-lavender flex items-center justify-center text-ultra-violet mb-4 shadow-subtle animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-deep-plum">{message}</p>
      <p className="text-xs text-muted-text mt-1">Securing zero-knowledge memory context</p>
    </div>
  );
}

export function EmptyState({
  title = 'No credentials found',
  description = 'Add your first login, credit card, or secure note to protect it in your vault.',
  actionLabel = 'Add Credential',
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-vault-border rounded-xl bg-white/60">
      <div className="w-12 h-12 rounded-xl bg-soft-apricot/30 text-deep-plum flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ultra-violet" />
      </div>
      <h3 className="text-base font-bold text-deep-plum">{title}</h3>
      <p className="text-sm text-muted-text max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <PrimaryButton onClick={onAction}>
          {actionLabel}
        </PrimaryButton>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Unable to load or process your vault data. Please try again.',
  retryAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-red-200 rounded-xl bg-red-50/50">
      <div className="w-12 h-12 rounded-xl bg-red-100 text-vault-error flex items-center justify-center mb-4">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-deep-plum">{title}</h3>
      <p className="text-sm text-muted-text max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>
      {retryAction && (
        <SecondaryButton onClick={retryAction} variant="white">
          Retry Request
        </SecondaryButton>
      )}
    </div>
  );
}
