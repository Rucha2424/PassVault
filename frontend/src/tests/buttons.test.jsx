import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrimaryButton from '../components/common/PrimaryButton';
import SecondaryButton from '../components/common/SecondaryButton';
import DestructiveButton from '../components/common/DestructiveButton';
import IconButton from '../components/common/IconButton';
import { KeyRound } from 'lucide-react';

describe('PassVault Strict Button Design Compliance', () => {
  it('PrimaryButton is rectangular (rounded-lg) and NOT pill-shaped (rounded-full)', () => {
    render(<PrimaryButton>Save Credential</PrimaryButton>);
    const button = screen.getByRole('button', { name: /save credential/i });

    expect(button).toBeInTheDocument();
    // Must contain rounded-lg
    expect(button.className).toContain('rounded-lg');
    // Must NOT be pill-shaped
    expect(button.className).not.toContain('rounded-full');
    // Must have solid ultra-violet
    expect(button.className).toContain('bg-ultra-violet');
    expect(button.className).toContain('text-white');
    // Must NOT be transparent
    expect(button.className).not.toContain('bg-transparent');
  });

  it('SecondaryButton is rectangular and has visible border with solid background', () => {
    render(<SecondaryButton>Cancel</SecondaryButton>);
    const button = screen.getByRole('button', { name: /cancel/i });

    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-lg');
    expect(button.className).not.toContain('rounded-full');
    expect(button.className).toContain('border-vault-border');
    expect(button.className).not.toContain('bg-transparent');
  });

  it('DestructiveButton is rectangular with solid/tinted error styling', () => {
    render(<DestructiveButton>Delete</DestructiveButton>);
    const button = screen.getByRole('button', { name: /delete/i });

    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-lg');
    expect(button.className).not.toContain('rounded-full');
    expect(button.className).toContain('bg-vault-error');
  });

  it('IconButton is compact rounded-lg square and NOT pill-shaped', () => {
    render(<IconButton icon={KeyRound} title="Key Action" />);
    const button = screen.getByRole('button', { name: /key action/i });

    expect(button).toBeInTheDocument();
    expect(button.className).toContain('rounded-lg');
    expect(button.className).not.toContain('rounded-full');
  });
});
