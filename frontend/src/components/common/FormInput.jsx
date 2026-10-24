import React from 'react';

/**
 * Reusable Form Input Component
 */
export default function FormInput({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-deep-plum mb-1.5"
        >
          {label} {required && <span className="text-vault-error">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-lg bg-white border text-sm text-deep-plum
            placeholder:text-muted-text/60 transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet
            disabled:bg-warm-ivory disabled:text-muted-text disabled:cursor-not-allowed
            h-10 px-3
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-vault-error focus:ring-vault-error/20 focus:border-vault-error' : 'border-vault-border'}
          `}
          {...props}
        />
      </div>

      {helpText && !error && (
        <p className="mt-1 text-xs text-muted-text">{helpText}</p>
      )}

      {error && (
        <p className="mt-1 text-xs text-vault-error font-medium">{error}</p>
      )}
    </div>
  );
}
