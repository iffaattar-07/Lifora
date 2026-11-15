'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, Bot } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function AssistantQuickInsight() {
  const { todaySchedule, appointments, profile } = useCare();

  const pendingDoses = todaySchedule.filter((d) => d.status === 'pending');
  const missedDoses = todaySchedule.filter((d) => d.status === 'missed');
  const nextApt = appointments[0];

  const generateContextualBrief = () => {
    if (missedDoses.length > 0) {
      return `Attention needed: ${missedDoses[0].medicationName} was marked as missed. I recommend reaching out to ${profile.emergencyContact.name} or Nurse Elena for schedule coordination.`;
    }
    if (pendingDoses.length > 0) {
      return `Margaret, you're on schedule! Your next dose of ${pendingDoses[0].medicationName} (${pendingDoses[0].dosage}) is set for ${pendingDoses[0].scheduledTime}. Remember: ${pendingDoses[0].instructions || 'Take with water.'}`;
    }
    return `All medications for today have been completed on time! Your next clinical checkup is with ${nextApt?.doctorName || 'your doctor'} on ${nextApt ? new Date(nextApt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'schedule'}.`;
  };

  return (
    <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-teal-700/60 shadow-elevated relative overflow-hidden">
      {/* Decorative calm background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-52 h-52 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-teal-950 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Intelligent Care Assistant
              </span>
              <span className="text-xs text-teal-300 font-medium hidden sm:inline">&bull; Context-Aware Daily Brief</span>
            </div>

            <p className="text-sm sm:text-base text-teal-50 mt-2 leading-relaxed max-w-3xl font-medium">
              &ldquo;{generateContextualBrief()}&rdquo;
            </p>
          </div>
        </div>

        <div className="shrink-0 self-start md:self-center">
          <a
            href="/assistant"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-teal-950 font-bold text-sm px-5 py-3 rounded-2xl transition shadow-md active:scale-98"
          >
            <span>Ask Care Assistant</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
