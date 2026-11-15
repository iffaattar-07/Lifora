import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CaregiverDashboardView } from '@/components/dashboard/caregiver/CaregiverDashboardView';

vi.mock('@/context/CareContext', () => ({
  useCare: () => ({
    userRole: 'family',
    profile: {
      name: 'Margaret Vance',
      preferredName: 'Margaret',
      age: 78,
      dob: '1948-04-12',
      primaryCondition: ['Hypertension', 'Type 2 Diabetes'],
      emergencyContact: { name: 'Sarah Vance', phone: '(503) 555-0192' },
      primaryDoctor: { name: 'Dr. Robert Hayes', clinic: 'Geriatric Health Center' },
    },
    todaySchedule: [
      {
        id: 'dose-1',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        scheduledTime: '08:00 AM',
        status: 'taken',
        recordedBy: 'Margaret Vance (Self)',
        instructions: 'Take with breakfast',
        withFood: 'with',
      },
      {
        id: 'dose-2',
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '01:00 PM',
        status: 'pending',
        instructions: 'Take with lunch',
        withFood: 'with',
      },
    ],
    adherenceStats: {
      todayPercentage: 50,
      weeklyPercentage: 92,
      monthlyPercentage: 88,
      consecutiveStreakDays: 5,
      totalScheduledToday: 2,
      totalTakenToday: 1,
    },
    medications: [
      {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        refillCount: 6,
        scheduleTimes: ['08:00 AM'],
        purpose: 'Blood Pressure',
      },
    ],
    appointments: [
      {
        id: 'apt-1',
        doctorName: 'Dr. Robert Hayes',
        specialty: 'Cardiology',
        facility: 'Providence St. Vincent',
        date: '2026-11-20',
        time: '10:30 AM',
        assignedEscort: 'Sarah Vance',
      },
    ],
    careCircle: [
      {
        id: 'member-1',
        name: 'Sarah Vance',
        relation: 'Daughter (Primary)',
        role: 'family',
        phone: '(503) 555-0192',
        isEmergencyContact: true,
      },
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'Medication Confirmed',
        message: 'Lisinopril taken at 08:05 AM',
        timestamp: '10 mins ago',
        type: 'medication_reminder',
        severity: 'success',
      },
    ],
    recentActivities: [
      {
        id: 'act-1',
        actor: 'Margaret Vance',
        action: 'dose_taken',
        description: 'Lisinopril (10 mg) confirmed',
        timestamp: '10 mins ago',
      },
    ],
    switchRole: vi.fn(),
  }),
}));

describe('CaregiverDashboardView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Sarah Vance monitoring header for Margaret Vance', () => {
    render(<CaregiverDashboardView />);

    expect(screen.getAllByText(/Sarah Vance/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Margaret Vance/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders clinical adherence metrics and vitals summary grid', () => {
    render(<CaregiverDashboardView />);

    expect(screen.getByText(/92%/i)).toBeInTheDocument();
    expect(screen.getByText(/7-Day Rolling Adherence/i)).toBeInTheDocument();
  });

  it('renders live medication monitor with active prescription list', () => {
    render(<CaregiverDashboardView />);

    expect(screen.getAllByText(/Lisinopril/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dr. Robert Hayes/i)).toBeInTheDocument();
  });
});
