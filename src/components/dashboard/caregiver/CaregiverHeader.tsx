'use client';

import React from 'react';
import { ShieldCheck, Heart, User, Clock, Bell, AlertTriangle } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverHeader() {
  const { profile, adherenceStats, notifications } = useCare();

  const unresolvedAlerts = notifications.filter((n) => !n.isRead && (n.severity === 'urgent' || n.severity === 'warning'));

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-200/90 shadow-soft-card">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-900 px-3 py-1 rounded-full border border-teal-300">
              Family &amp; Caregiver View
            </span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Synced live with Margaret&apos;s home schedule</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-stone-900 mt-2">
            Good afternoon, <span className="text-teal-800">Sarah</span>.
          </h1>

          <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-2xl leading-relaxed">
            Here&apos;s <strong className="text-stone-900 font-semibold">{profile.name}&apos;s</strong> care overview for today. You are actively subscribed to all medication and emergency updates.
          </p>
        </div>

        {/* Margaret Patient Summary Card */}
        <div className="bg-sage-50/80 p-4 sm:p-5 rounded-2xl border border-sage-200 flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-teal-900 text-white font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
            MV
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-stone-900 text-base">{profile.name}</h2>
              <span className="text-[11px] bg-white text-stone-700 font-semibold px-2 py-0.5 rounded border border-stone-200">
                {profile.age} yrs &bull; {profile.bloodType}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Primary: <span className="font-medium text-stone-900">{profile.primaryCondition[0]}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs">
              {unresolvedAlerts.length > 0 ? (
                <span className="text-rose-700 font-bold bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {unresolvedAlerts.length} Unresolved Alert{unresolvedAlerts.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Care Plan Stable
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
