import React, { useState } from 'react';
import {
  Globe,
  Star,
  Copy,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useVault } from '../../context/VaultContext';
import IconButton from '../common/IconButton';

export default function CredentialRow({ credential, onEdit, onDelete }) {
  const { toggleFavorite, copyToClipboard } = useVault();
  const [showPassword, setShowPassword] = useState(false);

  const getCleanDomain = (url) => {
    try {
      if (!url) return '';
      const formatted = url.startsWith('http') ? url : `https://${url}`;
      return new URL(formatted).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const domain = getCleanDomain(credential.url);

  return (
    <div className="bg-white border border-vault-border rounded-xl p-4 sm:p-5 shadow-subtle hover:border-ultra-violet/30 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left: Info */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-soft-lavender text-deep-violet flex items-center justify-center font-bold text-sm shrink-0 shadow-subtle">
          {credential.title ? credential.title.charAt(0).toUpperCase() : 'C'}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-deep-plum truncate">
              {credential.title}
            </h4>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-warm-ivory text-muted-text border border-vault-border">
              {credential.category || 'Logins'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-text flex-wrap">
            {credential.username && (
              <span className="flex items-center gap-1 font-mono text-deep-plum">
                <span>{credential.username}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(credential.username, 'Username')}
                  title="Copy username"
                  className="text-muted-text hover:text-ultra-violet transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </span>
            )}

            {domain && (
              <a
                href={credential.url.startsWith('http') ? credential.url : `https://${credential.url}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-muted-text hover:text-ultra-violet transition-colors truncate max-w-[200px]"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{domain}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
              </a>
            )}
          </div>

          {credential.notes && (
            <p className="text-xs text-muted-text line-clamp-1 italic pt-0.5">
              "{credential.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Center: Password Actions */}
      <div className="flex items-center gap-2 bg-warm-ivory/80 px-3 py-2 rounded-lg border border-vault-border self-start md:self-center">
        <div className="font-mono text-xs text-deep-plum w-28 sm:w-36 truncate select-none">
          {showPassword ? (
            credential.password || '••••••••'
          ) : (
            '••••••••••••'
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-text hover:text-deep-plum transition-colors p-1"
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(credential.password || '', 'Password')}
          className="text-muted-text hover:text-ultra-violet transition-colors p-1"
          title="Copy password"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Management Actions */}
      <div className="flex items-center gap-1.5 self-end md:self-center">
        <IconButton
          icon={Star}
          onClick={() => toggleFavorite(credential._id)}
          title={credential.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          variant="ghost"
          size="sm"
          className={credential.isFavorite ? 'text-amber-500 fill-amber-500 hover:text-amber-600' : ''}
        />
        <IconButton
          icon={Edit2}
          onClick={() => onEdit(credential)}
          title="Edit credential"
          variant="secondary"
          size="sm"
        />
        <IconButton
          icon={Trash2}
          onClick={() => onDelete(credential)}
          title="Delete credential"
          variant="destructive"
          size="sm"
        />
      </div>
    </div>
  );
}
