'use client';

import React from 'react';
import { CaregiverHeader } from './CaregiverHeader';
import { CaregiverVitalsGrid } from './CaregiverVitalsGrid';
import { CaregiverQuickActions } from './CaregiverQuickActions';
import { CaregiverMedicationMonitor } from './CaregiverMedicationMonitor';
import { CaregiverAlertsPanel } from './CaregiverAlertsPanel';
import { CaregiverAppointmentsManager } from './CaregiverAppointmentsManager';
import { CaregiverActivityFeed } from './CaregiverActivityFeed';
import { CaregiverCircleRoster } from './CaregiverCircleRoster';

export function CaregiverDashboardView() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* 1. Caregiver Persona & Patient Header */}
      <CaregiverHeader />

      {/* 2. Vitals & Adherence Metrics Overview */}
      <CaregiverVitalsGrid />

      {/* 3. Caregiver Quick Actions Ribbon */}
      <CaregiverQuickActions />

      {/* 4. Main Two-Column Coordination Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Column (7 cols): Live Medication Audit & Activity Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <CaregiverMedicationMonitor />
          <CaregiverActivityFeed />
        </div>

        {/* Right Column (5 cols): Exceptions, Appointments & Care Team */}
        <div className="lg:col-span-5 space-y-6">
          <CaregiverAlertsPanel />
          <CaregiverAppointmentsManager />
          <CaregiverCircleRoster />
        </div>
      </div>
    </div>
  );
}
