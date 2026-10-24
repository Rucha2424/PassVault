import React from 'react';

/**
 * Secondary Button Component
 * Follows strict button design rules:
 * - Rectangular with 8-12px border radius (rounded-lg)
 * - Solid white or soft lavender background
 * - Deep Plum or Deep Violet text
 * - Subtle visible border (#E9DFEE)
 * - Never pill-shaped, never transparent
 */
export default function SecondaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  fullWidth = false,
  variant = 'white', // 'white' or 'lavender'
  size = 'md',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs h-8',
    md: 'px-4 py-2 text-sm h-10',
    lg: 'px-5 py-2.5 text-base h-11',
  };

  const variantClasses = {
    white: 'bg-white hover:bg-warm-ivory text-deep-plum border-vault-border',
    lavender: 'bg-soft-lavender hover:bg-soft-lavender-dark text-deep-violet border-vault-border',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        border rounded-lg transition-colors duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-subtle
        ${variantClasses[variant] || variantClasses.white}
        ${sizeClasses[size] || sizeClasses.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-deep-plum" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 shrink-0 text-muted-text" />}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
}
