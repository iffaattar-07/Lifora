'use client';

import React from 'react';
import { useCare } from '@/context/CareContext';
import { SeniorDashboardView } from '@/components/dashboard/senior/SeniorDashboardView';
import { CaregiverDashboardView } from '@/components/dashboard/caregiver/CaregiverDashboardView';

export default function ExplicitDashboardPage() {
  const { activeRole } = useCare();

  return (
    <div className="transition-all duration-300">
      {activeRole === 'elderly' ? (
        <SeniorDashboardView />
      ) : (
        <CaregiverDashboardView />
      )}
    </div>
  );
}
