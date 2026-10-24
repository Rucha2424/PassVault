import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  EyeOff,
  Database,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TopNavbar from '../components/common/TopNavbar';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-warm-ivory flex flex-col">
      <TopNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle warm decorative accents */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-tr from-soft-apricot/30 to-soft-lavender/40 blur-3xl -z-10 rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-soft-lavender border border-vault-border text-xs font-semibold text-deep-violet">
                  <Sparkles className="w-3.5 h-3.5 text-ultra-violet" />
                  <span>Cloud Computing & DevOps Academic Project</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-deep-plum tracking-tight leading-[1.15]">
                  Your digital life, <br />
                  <span className="text-ultra-violet">securely in one place.</span>
                </h1>

                <p className="text-lg text-muted-text max-w-xl leading-relaxed">
                  Organize your passwords, create stronger credentials, and access your digital accounts with a vault designed around privacy, zero-knowledge architecture, and simplicity.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link to={isAuthenticated ? '/vault' : '/register'}>
                    <PrimaryButton size="lg" icon={ArrowRight}>
                      {isAuthenticated ? 'Open My Vault' : 'Create Your Free Vault'}
                    </PrimaryButton>
                  </Link>
                  <Link to="/generator">
                    <SecondaryButton size="lg" icon={KeyRound}>
                      Test Password Generator
                    </SecondaryButton>
                  </Link>
                </div>

                {/* Badges / Micro-assurances */}
                <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-muted-text">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-vault-success" />
                    <span>AES-256-GCM Encryption</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-vault-success" />
                    <span>Zero-Knowledge Server</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-vault-success" />
                    <span>Docker & CI/CD Ready</span>
                  </div>
                </div>
              </div>

              {/* Product Preview Card */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md rounded-2xl bg-white border border-vault-border shadow-elevated p-6 space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-vault-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-soft-apricot" />
                      <div className="w-3 h-3 rounded-full bg-soft-lavender-dark" />
                      <div className="w-3 h-3 rounded-full bg-vault-border" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-ultra-violet bg-soft-lavender px-2 py-0.5 rounded">
                      vault.unlocked
                    </span>
                  </div>

                  {/* Sample Mock Vault Row */}
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-warm-ivory border border-vault-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-ultra-violet text-white font-bold flex items-center justify-center text-xs">
                          G
                        </div>
                        <div>
                          <p className="text-xs font-bold text-deep-plum">Google Cloud Console</p>
                          <p className="text-[11px] text-muted-text font-mono">devops@company.internal</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-vault-border">
                        ••••••••••••
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-warm-ivory border border-vault-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-soft-apricot text-deep-plum font-bold flex items-center justify-center text-xs">
                          G
                        </div>
                        <div>
                          <p className="text-xs font-bold text-deep-plum">GitHub Production</p>
                          <p className="text-[11px] text-muted-text font-mono">octocat_lead</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-vault-border">
                        ••••••••••••
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-warm-ivory border border-vault-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-deep-violet text-white font-bold flex items-center justify-center text-xs">
                          A
                        </div>
                        <div>
                          <p className="text-xs font-bold text-deep-plum">AWS Root Account</p>
                          <p className="text-[11px] text-muted-text font-mono">cloud-infra@aws.org</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-vault-border">
                        ••••••••••••
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-deep-plum border-t border-vault-border">
                    <span className="text-muted-text">Vault Health Status</span>
                    <span className="text-vault-success flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" /> 98% Optimal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white border-y border-vault-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ultra-violet mb-2">
                Architecture & Cryptography
              </h2>
              <p className="text-3xl font-extrabold text-deep-plum">
                How PassVault Protects Your Secrets
              </p>
              <p className="mt-2 text-sm text-muted-text">
                Your credentials are encrypted client-side using Web Crypto standard algorithms before reaching the cloud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="p-6 rounded-xl bg-warm-ivory border border-vault-border relative">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet font-extrabold flex items-center justify-center mb-4 text-base">
                  01
                </div>
                <h3 className="text-base font-bold text-deep-plum mb-2">
                  PBKDF2 Key Derivation
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  When you sign in, your Master Password and unique per-user salt are processed through 100,000 iterations of PBKDF2 SHA-256 to generate an in-memory AES-GCM key.
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-6 rounded-xl bg-warm-ivory border border-vault-border relative">
                <div className="w-10 h-10 rounded-lg bg-soft-apricot text-deep-plum font-extrabold flex items-center justify-center mb-4 text-base">
                  02
                </div>
                <h3 className="text-base font-bold text-deep-plum mb-2">
                  Client-Side AES-256-GCM
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Every password and note is encrypted directly in your browser with a fresh 12-byte initialization vector. The server only receives ciphertext and cryptographic tags.
                </p>
              </div>

              {/* Step 3 */}
              <div className="p-6 rounded-xl bg-warm-ivory border border-vault-border relative">
                <div className="w-10 h-10 rounded-lg bg-deep-violet text-white font-extrabold flex items-center justify-center mb-4 text-base">
                  03
                </div>
                <h3 className="text-base font-bold text-deep-plum mb-2">
                  Zero-Knowledge Persistence
                </h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Even if the MongoDB database is inspected or compromised, attackers cannot read any stored passwords without your Master Password, which is never stored anywhere.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-20 bg-warm-ivory">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-wider text-ultra-violet mb-2">
                Engineered for Security & Simplicity
              </h2>
              <p className="text-3xl font-extrabold text-deep-plum">
                Everything you need to secure your cloud accounts
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">Zero-Knowledge Cloud Storage</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  No unencrypted passwords ever touch the network or the database. You hold the only key to decrypt your vault.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-apricot/40 text-deep-plum flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-ultra-violet" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">Cryptographic Password Generator</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Uses true Web Crypto random values with customizable length, symbols, and exclusion of ambiguous characters.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">Password Health Auditor</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Evaluates vault strength locally. Identifies weak credentials, reused passwords, and stale logins without sending data anywhere.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">Auto-Lock Inactivity Safeguard</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Configurable memory purge timer automatically clears your decryption key if you step away from your workstation.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-apricot/40 text-deep-plum flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-ultra-violet" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">Docker Compose & Cloud Ready</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Containerized multi-stage builds with isolated networking, persistent MongoDB volumes, and automated healthchecks.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-white border border-vault-border shadow-subtle space-y-3">
                <div className="w-10 h-10 rounded-lg bg-soft-lavender text-ultra-violet flex items-center justify-center">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-deep-plum">GitHub Actions Automated CI</h3>
                <p className="text-xs text-muted-text leading-relaxed">
                  Continuous integration testing covering registration, protected routes, encryption integrity, and Docker container builds.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-white border-t border-vault-border">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl font-extrabold text-deep-plum">
              Start securing your passwords today.
            </h2>
            <p className="text-sm text-muted-text max-w-xl mx-auto">
              Open source, zero-knowledge, and built with modern Cloud Computing & DevOps principles.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/register">
                <PrimaryButton size="lg">
                  Create Vault Now
                </PrimaryButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-vault-border py-8 text-xs text-muted-text">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-deep-plum">PassVault</span>
            <span>— Secure Cloud-Based Password Manager</span>
          </div>
          <div className="flex items-center gap-6">
            <span>React + Node.js + MongoDB</span>
            <span>Docker + GitHub Actions</span>
            <span>Client-Side AES-256-GCM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
