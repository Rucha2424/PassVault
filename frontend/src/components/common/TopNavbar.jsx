import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Shield,
  KeyRound,
  Activity,
  Settings,
  Lock,
  Unlock,
  Menu,
  X,
  LogOut,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVault } from '../../context/VaultContext';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import IconButton from './IconButton';

export default function TopNavbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isUnlocked, lockVault, setIsUnlockModalOpen } = useVault();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    lockVault();
    await logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home, showAlways: true },
    { label: 'Vault', path: '/vault', icon: KeyRound, authOnly: true },
    { label: 'Generator', path: '/generator', icon: Shield, showAlways: true },
    { label: 'Password Health', path: '/health', icon: Activity, authOnly: true },
    { label: 'Settings', path: '/settings', icon: Settings, authOnly: true },
  ];

  const visibleLinks = navLinks.filter(
    (link) => link.showAlways || (link.authOnly && isAuthenticated)
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-vault-border shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo and Wordmark */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-ultra-violet text-white flex items-center justify-center shadow-subtle group-hover:bg-ultra-violet-hover transition-colors">
                <Shield className="w-5 h-5 fill-soft-apricot text-ultra-violet" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg text-deep-plum tracking-tight">Pass</span>
                  <span className="font-extrabold text-lg text-ultra-violet tracking-tight">Vault</span>
                </div>
                <span className="text-[10px] tracking-wider uppercase text-muted-text font-semibold hidden sm:inline -mt-1">
                  Zero-Knowledge
                </span>
              </div>
            </Link>
          </div>

          {/* Center section: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${
                      isActive
                        ? 'text-ultra-violet bg-soft-lavender/60 font-semibold shadow-subtle'
                        : 'text-deep-plum hover:text-ultra-violet hover:bg-warm-ivory'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right section: Auth Controls or Guest CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Vault Status Indicator & Quick Lock/Unlock */}
                {isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => lockVault()}
                    title="Vault is unlocked in memory. Click to lock immediately."
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-vault-success border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlocked</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsUnlockModalOpen(true)}
                    title="Vault is locked. Click to unlock with master password."
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-soft-apricot/20 text-deep-plum border border-soft-apricot hover:bg-soft-apricot/30 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5 text-ultra-violet" />
                    <span>Vault Locked</span>
                  </button>
                )}

                {/* User Account Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-vault-border hover:bg-warm-ivory transition-colors text-deep-plum focus:outline-none focus:ring-2 focus:ring-ultra-violet/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-soft-lavender text-deep-violet flex items-center justify-center font-bold text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-medium max-w-[120px] truncate">
                      {user?.email}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-vault-border rounded-xl shadow-elevated py-1.5 z-50 animate-fade-in">
                      <div className="px-3.5 py-2 border-b border-vault-border">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-text">
                          Signed in as
                        </p>
                        <p className="text-xs font-bold text-deep-plum truncate mt-0.5">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/vault"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-deep-plum hover:bg-warm-ivory hover:text-ultra-violet"
                      >
                        <KeyRound className="w-4 h-4 text-muted-text" />
                        <span>My Vault</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-deep-plum hover:bg-warm-ivory hover:text-ultra-violet"
                      >
                        <Settings className="w-4 h-4 text-muted-text" />
                        <span>Settings</span>
                      </Link>

                      <div className="border-t border-vault-border my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-vault-error hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <SecondaryButton size="sm">
                    Sign In
                  </SecondaryButton>
                </Link>
                <Link to="/register">
                  <PrimaryButton size="sm">
                    Get Started
                  </PrimaryButton>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && (
              isUnlocked ? (
                <span className="p-1.5 rounded-lg bg-emerald-50 text-vault-success text-xs font-semibold flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" />
                </span>
              ) : (
                <span
                  onClick={() => setIsUnlockModalOpen(true)}
                  className="p-1.5 rounded-lg bg-amber-50 text-warning text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-ultra-violet" />
                </span>
              )
            )}

            <IconButton
              icon={mobileMenuOpen ? X : Menu}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Navigation Menu"
              size="md"
            />
          </div>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Dropdown (Below top bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-vault-border bg-white px-4 pt-3 pb-5 space-y-2 animate-fade-in shadow-elevated">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium
                  ${
                    isActive
                      ? 'bg-soft-lavender text-ultra-violet font-semibold'
                      : 'text-deep-plum hover:bg-warm-ivory'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-3 border-t border-vault-border space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3.5 py-1 text-xs text-muted-text">
                  Signed in as <strong className="text-deep-plum">{user?.email}</strong>
                </div>

                <div className="flex gap-2">
                  {isUnlocked ? (
                    <SecondaryButton
                      fullWidth
                      size="sm"
                      onClick={() => {
                        lockVault();
                        setMobileMenuOpen(false);
                      }}
                      icon={Lock}
                    >
                      Lock Vault
                    </SecondaryButton>
                  ) : (
                    <PrimaryButton
                      fullWidth
                      size="sm"
                      onClick={() => {
                        setIsUnlockModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      icon={Unlock}
                    >
                      Unlock Vault
                    </PrimaryButton>
                  )}
                  <SecondaryButton
                    fullWidth
                    size="sm"
                    onClick={handleLogout}
                    icon={LogOut}
                    className="text-vault-error"
                  >
                    Logout
                  </SecondaryButton>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <SecondaryButton fullWidth size="md">
                    Sign In
                  </SecondaryButton>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <PrimaryButton fullWidth size="md">
                    Get Started Free
                  </PrimaryButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
