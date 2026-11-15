'use client';

import React from 'react';
import { Sparkles, MessageCircle, ArrowRight, Volume2 } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorAssistantPrompt() {
  const { todaySchedule, profile } = useCare();
  const pendingDoses = todaySchedule.filter((d) => d.status === 'pending');

  return (
    <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border-2 border-teal-700 shadow-elevated relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-teal-950 flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40">
                LIFORA Care Companion
              </span>
            </div>
            <p className="text-lg font-bold text-white mt-1.5 font-serif">
              Have a question about your medicines or appointments?
            </p>
            <p className="text-sm text-teal-100/90 mt-1 max-w-2xl leading-relaxed">
              I can tell you when your next dose is due, whether to take it with food, or help you call Sarah.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <a
            href="/assistant"
            className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-teal-950 font-extrabold text-sm sm:text-base px-6 py-4 rounded-2xl transition shadow-md"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Ask Care Companion</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
