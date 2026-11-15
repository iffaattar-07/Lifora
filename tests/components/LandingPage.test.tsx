import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '@/components/landing/LandingPage';

describe('LandingPage Component', () => {
  it('renders hero title and core platform tagline', () => {
    render(<LandingPage onOpenDemoLogin={vi.fn()} />);

    expect(screen.getByText('Making every day healthier, together.')).toBeInTheDocument();
    expect(screen.getByText(/Intelligent Elderly Care/i)).toBeInTheDocument();
  });

  it('renders quick demo login buttons for Senior and Family accounts', () => {
    const onOpenDemoLogin = vi.fn();
    render(<LandingPage onOpenDemoLogin={onOpenDemoLogin} />);

    expect(screen.getByText(/Senior Demo Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Family Demo Login/i)).toBeInTheDocument();
  });

  it('renders 5 core feature pillars: Medications, Care Circle, Appointments, Assistant, and Emergency', () => {
    render(<LandingPage onOpenDemoLogin={vi.fn()} />);

    expect(screen.getByText(/Medication Tracking/i)).toBeInTheDocument();
    expect(screen.getByText(/Care Circle Network/i)).toBeInTheDocument();
    expect(screen.getByText(/Appointment Coordination/i)).toBeInTheDocument();
    expect(screen.getByText(/AI Care Companion/i)).toBeInTheDocument();
    expect(screen.getByText(/24\/7 Emergency Safety/i)).toBeInTheDocument();
  });

  it('renders interactive clinical safeguard demonstration module', () => {
    render(<LandingPage onOpenDemoLogin={vi.fn()} />);

    expect(screen.getByText(/Clinical Medical Safeguard Filter/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Safe Guardrail/i)).toBeInTheDocument();
  });
});
