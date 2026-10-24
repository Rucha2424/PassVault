import React from 'react';

/**
 * Icon Button Component
 * Follows strict button design rules:
 * - Compact square or gently rounded-square (rounded-lg)
 * - Accessible title/aria-label
 * - Not pill-shaped
 */
export default function IconButton({
  icon: Icon,
  onClick,
  title,
  type = 'button',
  disabled = false,
  className = '',
  variant = 'secondary', // 'primary', 'secondary', 'ghost', 'destructive'
  size = 'md',
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    primary: 'bg-ultra-violet text-white hover:bg-ultra-violet-hover border border-transparent shadow-subtle',
    secondary: 'bg-white hover:bg-warm-ivory text-deep-plum border border-vault-border shadow-subtle',
    ghost: 'bg-transparent hover:bg-soft-lavender text-muted-text hover:text-deep-plum border border-transparent',
    destructive: 'bg-red-50 hover:bg-red-100 text-vault-error border border-red-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`
        inline-flex items-center justify-center shrink-0
        rounded-lg transition-colors duration-150 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-ultra-violet/30 focus:ring-offset-1
        disabled:opacity-40 disabled:cursor-not-allowed
        ${sizeClasses[size] || sizeClasses.md}
        ${variantClasses[variant] || variantClasses.secondary}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size] || iconSizes.md} />}
    </button>
  );
}
