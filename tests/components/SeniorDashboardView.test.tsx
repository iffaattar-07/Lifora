import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeniorDashboardView } from '@/components/dashboard/senior/SeniorDashboardView';

const mockMarkDoseAsTaken = vi.fn();
const mockTriggerEmergencyAlert = vi.fn();

vi.mock('@/context/CareContext', () => ({
  useCare: () => ({
    profile: {
      preferredName: 'Margaret',
      name: 'Margaret Vance',
      emergencyContact: {
        name: 'Sarah Vance',
        phone: '(503) 555-0192',
      },
    },
    todaySchedule: [
      {
        id: 'dose-1',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        scheduledTime: '08:00 AM',
        status: 'pending',
        instructions: 'Take with breakfast',
        withFood: 'with',
      },
    ],
    adherenceStats: {
      todayPercentage: 50,
      totalScheduledToday: 2,
      totalTakenToday: 1,
      consecutiveStreakDays: 5,
    },
    appointments: [
      {
        id: 'apt-1',
        doctorName: 'Dr. Robert Hayes',
        specialty: 'Cardiology',
        facility: 'St. Vincent Medical Center',
        date: '2026-11-20',
        time: '10:30 AM',
        assignedEscort: 'Sarah Vance',
      },
    ],
    careCircle: [
      {
        id: 'member-1',
        name: 'Sarah Vance',
        relation: 'Daughter',
        role: 'family',
        phone: '(503) 555-0192',
      },
    ],
    markDoseAsTaken: mockMarkDoseAsTaken,
    triggerEmergencyAlert: mockTriggerEmergencyAlert,
  }),
}));

describe('SeniorDashboardView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders personalized senior greeting and accessible action ribbon', () => {
    render(<SeniorDashboardView />);

    expect(screen.getByText(/Margaret/i)).toBeInTheDocument();
    expect(screen.getByText(/Call Daughter/i)).toBeInTheDocument();
    expect(screen.getByText(/My Medicine/i)).toBeInTheDocument();
    expect(screen.getByText(/Doctor Visits/i)).toBeInTheDocument();
  });

  it('renders the Next Dose Hero card with high-contrast pill details and I Took This trigger', () => {
    render(<SeniorDashboardView />);

    expect(screen.getAllByText('Lisinopril').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/10mg/i).length).toBeGreaterThanOrEqual(1);

    const tookButtons = screen.getAllByRole('button', { name: /I Took This/i });
    expect(tookButtons.length).toBeGreaterThan(0);

    fireEvent.click(tookButtons[0]);
    expect(mockMarkDoseAsTaken).toHaveBeenCalledWith('dose-1');
  });

  it('renders upcoming doctor appointment preview with confirmed companion', () => {
    render(<SeniorDashboardView />);

    expect(screen.getByText('Dr. Robert Hayes')).toBeInTheDocument();
    expect(screen.getByText(/Cardiology/i)).toBeInTheDocument();
  });
});
