import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LandingPage } from '@/components/landing/LandingPage';

const mockLoginDemo = vi.fn();
const mockSetIsLoginModalOpen = vi.fn();

vi.mock('@/context/CareContext', () => ({
  useCare: () => ({
    loginDemo: mockLoginDemo,
    isLoginModalOpen: false,
    setIsLoginModalOpen: mockSetIsLoginModalOpen,
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it('renders interactive safeguard test trigger and displays safety notice when clicked', () => {
    render(<LandingPage />);

    const testPrompt = screen.getByText(/Test the Clinical Safeguard Filter live:/i);
    expect(testPrompt).toBeInTheDocument();

    const doubleDoseBtn = screen.getByRole('button', { name: /Can I double my dose\?/i });
    expect(doubleDoseBtn).toBeInTheDocument();

    fireEvent.click(doubleDoseBtn);

    expect(screen.getByText(/Safety Safeguard Triggered/i)).toBeInTheDocument();
  });

  it('allows marking hero dose as taken with celebratory feedback', () => {
    render(<LandingPage />);

    const tookBtn = screen.getByRole('button', { name: /I Took This Now/i });
    expect(tookBtn).toBeInTheDocument();

    fireEvent.click(tookBtn);

    expect(screen.getByText(/Dose Recorded as Taken!/i)).toBeInTheDocument();
  });

  it('triggers login modal when Explore Demo Accounts is clicked', () => {
    render(<LandingPage />);

    const exploreBtn = screen.getByText(/Explore Demo Accounts/i);
    fireEvent.click(exploreBtn);

    expect(mockSetIsLoginModalOpen).toHaveBeenCalledWith(true);
  });
});
