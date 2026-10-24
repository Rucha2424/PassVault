import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  Shield,
} from 'lucide-react';
import { generateSecurePassword, analyzePassword } from '../crypto/passwordAnalyzer';
import { useVault } from '../context/VaultContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

export default function GeneratorPage() {
  const { copyToClipboard } = useVault();

  const [length, setLength] = useState(18);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const newPass = generateSecurePassword({
      length,
      uppercase,
      lowercase,
      numbers,
      symbols,
      avoidAmbiguous,
    });
    setPassword(newPass);
    setCopied(false);
  };

  useEffect(() => {
    handleGenerate();
  }, [length, uppercase, lowercase, numbers, symbols, avoidAmbiguous]);

  const handleCopy = async () => {
    await copyToClipboard(password, 'Generated password');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const analysis = analyzePassword(password);

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-soft-lavender border border-vault-border text-xs font-semibold text-deep-violet">
            <Sparkles className="w-3.5 h-3.5 text-ultra-violet" />
            <span>Web Crypto API &bull; True Entropy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-deep-plum tracking-tight">
            Cryptographic Password Generator
          </h1>
          <p className="text-xs sm:text-sm text-muted-text max-w-lg mx-auto">
            Create high-entropy, unpredictable passwords using your browser's hardware random number generator (<code className="font-mono text-deep-plum">crypto.getRandomValues</code>).
          </p>
        </div>

        {/* Generator Box */}
        <div className="bg-white border border-vault-border rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
          {/* Password Output Area */}
          <div className="p-4 sm:p-6 rounded-xl bg-soft-lavender/60 border border-vault-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Generated Secret
              </span>
              <div className="flex items-center gap-1 text-xs font-bold" style={{ color: analysis.color }}>
                <Shield className="w-3.5 h-3.5" />
                <span>{analysis.label} ({analysis.entropy} bits)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-vault-border shadow-subtle">
              <span className="font-mono text-base sm:text-lg text-deep-plum tracking-wide select-all break-all">
                {password}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="p-2 rounded-lg text-muted-text hover:text-ultra-violet hover:bg-soft-lavender transition-colors"
                  title="Generate new password"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-ultra-violet text-white hover:bg-ultra-violet-hover transition-colors shadow-subtle"
                  title="Copy password to clipboard"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength Meter Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-2 w-full bg-soft-lavender-dark rounded-full overflow-hidden flex gap-1">
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
          </div>

          {/* Controls & Options */}
          <div className="space-y-6 pt-2">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-deep-plum">Password Length</span>
                <span className="font-mono font-bold text-ultra-violet bg-soft-lavender px-2.5 py-0.5 rounded text-sm">
                  {length} characters
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-soft-lavender rounded-lg appearance-none cursor-pointer accent-ultra-violet"
              />
              <div className="flex justify-between text-[11px] text-muted-text">
                <span>8 (Minimum)</span>
                <span>16 (Recommended)</span>
                <span>32 (Strong)</span>
                <span>64 (Maximum)</span>
              </div>
            </div>

            {/* Character Set Checkboxes */}
            <div className="space-y-3">
              <span className="block text-xs font-semibold uppercase tracking-wider text-deep-plum">
                Included Character Sets
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-vault-border bg-warm-ivory/50 hover:bg-warm-ivory cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.target.checked)}
                    className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-deep-plum">Uppercase Letters</p>
                    <p className="text-muted-text font-mono">A B C D E F G</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-vault-border bg-warm-ivory/50 hover:bg-warm-ivory cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={lowercase}
                    onChange={(e) => setLowercase(e.target.checked)}
                    className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-deep-plum">Lowercase Letters</p>
                    <p className="text-muted-text font-mono">a b c d e f g</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-vault-border bg-warm-ivory/50 hover:bg-warm-ivory cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={numbers}
                    onChange={(e) => setNumbers(e.target.checked)}
                    className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-deep-plum">Numbers</p>
                    <p className="text-muted-text font-mono">0 1 2 3 4 5 6 7 8 9</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-vault-border bg-warm-ivory/50 hover:bg-warm-ivory cursor-pointer select-none transition-colors">
                  <input
                    type="checkbox"
                    checked={symbols}
                    onChange={(e) => setSymbols(e.target.checked)}
                    className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-deep-plum">Special Symbols</p>
                    <p className="text-muted-text font-mono">! @ # $ % ^ & *</p>
                  </div>
                </label>
              </div>

              {/* Avoid Ambiguous Characters Option */}
              <label className="flex items-center gap-3 p-3 rounded-lg border border-soft-apricot bg-soft-apricot/15 hover:bg-soft-apricot/25 cursor-pointer select-none transition-colors mt-2">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="w-4 h-4 rounded text-ultra-violet focus:ring-ultra-violet border-vault-border"
                />
                <div className="text-xs">
                  <p className="font-bold text-deep-plum">Avoid Ambiguous Characters</p>
                  <p className="text-muted-text">
                    Excludes visually confusing characters: <span className="font-mono font-semibold">0, O, o, 1, l, I, |</span>
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-vault-border">
              <PrimaryButton
                onClick={handleGenerate}
                fullWidth
                size="md"
                icon={RefreshCw}
              >
                Generate New Password
              </PrimaryButton>
              <SecondaryButton
                onClick={handleCopy}
                fullWidth
                size="md"
                icon={Copy}
              >
                Copy to Clipboard
              </SecondaryButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
