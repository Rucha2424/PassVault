import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { analyzePassword } from '../../crypto/passwordAnalyzer';

/**
 * Reusable Password Input Component with reveal toggle and optional strength meter
 */
export default function PasswordInput({
  label,
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••••••',
  required = false,
  error = '',
  helpText = '',
  disabled = false,
  showStrength = false,
  className = '',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;

  const analysis = showStrength && value ? analyzePassword(value) : null;

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
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-text">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="current-password"
          className={`
            w-full rounded-lg bg-white border text-sm text-deep-plum font-mono
            placeholder:text-muted-text/60 transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-ultra-violet/20 focus:border-ultra-violet
            disabled:bg-warm-ivory disabled:text-muted-text disabled:cursor-not-allowed
            h-10 pl-9 pr-10
            ${error ? 'border-vault-error focus:ring-vault-error/20 focus:border-vault-error' : 'border-vault-border'}
          `}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-text hover:text-deep-plum transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Optional Password Strength Indicator */}
      {showStrength && value && analysis && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-text">Strength:</span>
            <span className="font-semibold" style={{ color: analysis.color }}>
              {analysis.label} ({analysis.entropy} bits)
            </span>
          </div>
          <div className="h-1.5 w-full bg-soft-lavender rounded-full overflow-hidden flex gap-0.5">
            {[0, 1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className="h-full flex-1 transition-all duration-300"
                style={{
                  backgroundColor: step <= analysis.score ? analysis.color : '#E9DFEE',
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted-text">{analysis.feedback}</p>
        </div>
      )}

      {helpText && !error && (
        <p className="mt-1 text-xs text-muted-text">{helpText}</p>
      )}

      {error && (
        <p className="mt-1 text-xs text-vault-error font-medium">{error}</p>
      )}
    </div>
  );
}
