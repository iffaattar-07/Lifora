'use client';

import React from 'react';
import { Sparkles, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function PersonalizedGreeting() {
  const { profile, activeRole, adherenceStats, todaySchedule } = useCare();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const nextPendingDose = todaySchedule.find((d) => d.status === 'pending');
  const allTaken = todaySchedule.length > 0 && todaySchedule.every((d) => d.status === 'taken');

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-elevated relative overflow-hidden border border-teal-700/40">
      {/* Subtle organic background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          {/* Date pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/80 border border-teal-700/60 text-teal-200 text-xs font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDate}</span>
            <span className="text-teal-400">&bull;</span>
            <span className="text-emerald-300">Portland, OR (58°F &bull; Calm)</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-white">
            {getGreeting()},{' '}
            <span className="text-emerald-300">
              {activeRole === 'elderly' ? profile.preferredName : profile.name}
            </span>
          </h1>

          <p className="text-teal-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            {activeRole === 'elderly' ? (
              allTaken ? (
                'You have completed all scheduled medications for today. Rest easy and enjoy your day!'
              ) : nextPendingDose ? (
                <>Your next care item is <strong>{nextPendingDose.medicationName}</strong> at <strong>{nextPendingDose.scheduledTime}</strong>. Keep up the wonderful rhythm!</>
              ) : (
                'Your care circle is actively synced to support your daily wellness.'
              )
            ) : (
              `You are actively viewing Margaret Vance's care plan. Overall adherence is steady at ${adherenceStats.weeklyPercentage}% with zero critical alerts.`
            )}
          </p>
        </div>

        {/* Adherence Streak Badge */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 bg-teal-950/50 p-4 rounded-2xl border border-teal-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold tracking-wider text-teal-300">Care Adherence</p>
              <p className="text-lg font-bold text-white leading-none">
                {adherenceStats.consecutiveStreakDays} Days Consistent
              </p>
            </div>
          </div>

          <div className="text-xs text-teal-200/90 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{adherenceStats.totalTakenToday} of {adherenceStats.totalScheduledToday} doses taken today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
