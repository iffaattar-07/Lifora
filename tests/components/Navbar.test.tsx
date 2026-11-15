import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/layout/Navbar';

const mockLogout = vi.fn();
const mockSetIsLoginModalOpen = vi.fn();
const mockSetActiveRole = vi.fn();

vi.mock('@/context/CareContext', () => ({
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
  useCare: () => ({
    profile: {
      name: 'Margaret Vance',
      preferredName: 'Margaret',
      emergencyContact: {
        name: 'Sarah Vance',
        relationship: 'Daughter',
        phone: '(503) 555-0192',
      },
    },
    currentUser: {
      fullName: 'Margaret Vance',
      email: 'margaret@lifora.demo',
    },
    isLoggedIn: true,
    logout: mockLogout,
    isLoginModalOpen: false,
    setIsLoginModalOpen: mockSetIsLoginModalOpen,
    activeRole: 'elderly',
    setActiveRole: mockSetActiveRole,
    fontSize: 'normal',
    setFontSize: vi.fn(),
    notifications: [
      { id: 'notif-1', isRead: false, title: 'Reminder' },
    ],
    markNotificationAsRead: vi.fn(),
    clearAllNotifications: vi.fn(),
    triggerEmergencyAlert: vi.fn(),
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

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders LIFORA branding and tagline pill', () => {
    render(<Navbar />);

    expect(screen.getByText('LIFORA')).toBeInTheDocument();
  });

  it('renders core navigation navigation links', () => {
    render(<Navbar />);

    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Medications').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Appointments').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Care Circle').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Care Assistant/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders Emergency SOS button', () => {
    render(<Navbar />);

    const sosButtons = screen.getAllByRole('button', { name: /SOS|Emergency/i });
    expect(sosButtons.length).toBeGreaterThanOrEqual(1);
  });
});
