'use client';

import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Calendar, 
  Pill, 
  UserCheck, 
  AlertCircle, 
  FileText,
  Clock
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverActivityFeed() {
  const { recentActivities } = useCare();

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'dose_taken':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'dose_missed':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'appointment_scheduled':
      case 'appointment_escort':
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case 'medication_added':
      case 'refill_requested':
        return <Pill className="w-4 h-4 text-teal-600" />;
      case 'vitals_logged':
        return <UserCheck className="w-4 h-4 text-emerald-600" />;
      default:
        return <Activity className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-stone-900 font-serif">Recent Care Activity</h3>
            <span className="text-[11px] font-bold bg-sage-100 text-teal-900 px-2 py-0.5 rounded-full border border-sage-200">
              Live Audit Log
            </span>
          </div>
          <span className="text-xs text-stone-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Real-time</span>
          </span>
        </div>

        {/* Timeline Items */}
        <div className="mt-4 space-y-4">
          {(recentActivities || []).slice(0, 5).map((act) => (
            <div key={act.id} className="flex items-start gap-3.5 text-xs">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5 border border-stone-200">
                {getActionIcon(act.action)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-stone-900">{act.title}</p>
                  <span className="text-[10px] text-stone-400 font-medium shrink-0">{act.timestamp}</span>
                </div>

                <p className="text-stone-600 mt-0.5 leading-relaxed">{act.description}</p>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                    By: {act.actorName}
                  </span>
                  {act.badge && (
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      {act.badge}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-stone-100 text-xs text-stone-400 text-center">
        All entries are timestamped and preserved for physician reviews.
      </div>
    </div>
  );
}
