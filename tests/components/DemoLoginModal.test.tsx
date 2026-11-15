import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DemoLoginModal } from '@/components/auth/DemoLoginModal';

const mockLoginDemo = vi.fn();

vi.mock('@/context/CareContext', () => ({
  useCare: () => ({
    loginDemo: mockLoginDemo,
  }),
  DEMO_ACCOUNTS: {
    senior: {
      name: 'Margaret Vance',
      email: 'margaret@lifora.demo',
      password: 'Margaret@123',
      role: 'elderly',
      description: 'Senior Patient View',
    },
    caregiver: {
      name: 'Sarah Vance',
      email: 'sarah@lifora.demo',
      password: 'Sarah@123',
      role: 'family',
      description: 'Family / Caregiver View',
    },
  },
}));

describe('DemoLoginModal Component', () => {
  const onClose = vi.fn();
  const onSuccessRedirect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DemoLoginModal isOpen={false} onClose={onClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with Margaret Vance and Sarah Vance options when open', () => {
    render(
      <DemoLoginModal isOpen={true} onClose={onClose} onSuccessRedirect={onSuccessRedirect} />
    );

    expect(screen.getByText('Sign In to LIFORA')).toBeInTheDocument();
    expect(screen.getByText('Margaret Vance')).toBeInTheDocument();
    expect(screen.getByText('Sarah Vance')).toBeInTheDocument();
    expect(screen.getByDisplayValue('margaret@lifora.demo')).toBeInTheDocument();
  });

  it('switches to Caregiver credentials when Sarah persona is clicked', () => {
    render(
      <DemoLoginModal isOpen={true} onClose={onClose} onSuccessRedirect={onSuccessRedirect} />
    );

    const caregiverButton = screen.getByText('Sarah Vance');
    fireEvent.click(caregiverButton);

    expect(screen.getByDisplayValue('sarah@lifora.demo')).toBeInTheDocument();
  });

  it('executes quick login for Margaret Vance and triggers callbacks', async () => {
    render(
      <DemoLoginModal isOpen={true} onClose={onClose} onSuccessRedirect={onSuccessRedirect} />
    );

    const quickLoginButtons = screen.getAllByRole('button', { name: /Auto-fill & Log In/i });
    fireEvent.click(quickLoginButtons[0]);

    await waitFor(() => {
      expect(mockLoginDemo).toHaveBeenCalledWith('senior');
      expect(onClose).toHaveBeenCalled();
      expect(onSuccessRedirect).toHaveBeenCalledWith('elderly');
    }, { timeout: 1500 });
  });

  it('calls onClose when close icon is clicked', () => {
    render(
      <DemoLoginModal isOpen={true} onClose={onClose} />
    );

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
