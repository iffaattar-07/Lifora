import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPage } from '@/components/landing/LandingPage';

vi.mock('@/context/CareContext', () => ({
  useCare: () => ({
    loginDemo: vi.fn(),
    isLoginModalOpen: false,
    setIsLoginModalOpen: vi.fn(),
  }),
  DEMO_ACCOUNTS: {
    senior: {
      name: 'Margaret Vance',
      email: 'margaret@lifora.demo',
      password: 'Margaret@123',
    },
    caregiver: {
      name: 'Sarah Vance',
      email: 'sarah@lifora.demo',
      password: 'Sarah@123',
    },
  },
}));

describe('LandingPage Component', () => {
  it('renders hero title and core platform tagline', () => {
    render(<LandingPage />);

    expect(screen.getByText(/healthier, together\./i)).toBeInTheDocument();
    expect(screen.getByText(/Intelligent Elderly Care/i)).toBeInTheDocument();
  });

  it('renders quick demo exploration buttons and launch triggers', () => {
    render(<LandingPage />);

    expect(screen.getByText(/Explore Demo Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/Launch Senior View \(Margaret\)/i)).toBeInTheDocument();
  });

  it('renders verified badges and clinical safeguards highlights', () => {
    render(<LandingPage />);

    expect(screen.getByText(/Clinical Safety Safeguards/i)).toBeInTheDocument();
    expect(screen.getByText(/92% Adherence Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant Emergency SOS/i)).toBeInTheDocument();
    expect(screen.getByText(/Context-Aware AI Companion/i)).toBeInTheDocument();
  });
});
