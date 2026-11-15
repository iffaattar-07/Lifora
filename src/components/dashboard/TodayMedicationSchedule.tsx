'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Check, 
  Clock, 
  X, 
  AlertCircle, 
  ChevronRight, 
  Utensils, 
  CalendarDays,
  Plus
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { DoseScheduleItem } from '@/types';

export function TodayMedicationSchedule() {
  const { todaySchedule, markDoseAsTaken, markDoseAsMissed, activeRole } = useCare();
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');

  const filteredDoses = todaySchedule.filter((dose) => {
    if (filter === 'pending') return dose.status === 'pending';
    if (filter === 'taken') return dose.status === 'taken';
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 font-serif">Today&apos;s Medication Schedule</h2>
            <span className="text-xs font-bold bg-sage-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-sage-200">
              {todaySchedule.filter((d) => d.status === 'taken').length} / {todaySchedule.length} Complete
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Synchronized with Margaret&apos;s doctor prescriptions and care circle.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({todaySchedule.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'pending' ? 'bg-white text-amber-800 shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pending ({todaySchedule.filter((d) => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('taken')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'taken' ? 'bg-white text-emerald-800 shadow-sm font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Taken ({todaySchedule.filter((d) => d.status === 'taken').length})
          </button>
        </div>
      </div>

      {/* Doses List */}
      <div className="mt-5 space-y-3">
        {filteredDoses.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <p className="text-sm font-medium text-stone-600">No doses matching the selected filter.</p>
          </div>
        ) : (
          filteredDoses.map((dose) => (
            <div
              key={dose.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                dose.status === 'taken'
                  ? 'bg-emerald-50/40 border-emerald-200/80'
                  : dose.status === 'missed'
                  ? 'bg-rose-50/40 border-rose-200/80'
                  : 'bg-white hover:bg-stone-50/60 border-stone-200 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Form icon with color dot */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: dose.color || '#2E847D' }}
                >
                  <Pill className="w-6 h-6" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-stone-900 text-base sm:text-lg">
                      {dose.medicationName}
                    </h4>
                    <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      {dose.dosage}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {dose.form}
                    </span>
                  </div>

                  {dose.purpose && (
                    <p className="text-xs text-teal-900 font-medium mt-0.5">
                      For: {dose.purpose}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-stone-500 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-stone-700 bg-stone-100/90 px-2 py-0.5 rounded">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      {dose.scheduledTime}
                    </span>
                    {dose.instructions && (
                      <span className="flex items-center gap-1 text-stone-600">
                        <Utensils className="w-3.5 h-3.5 text-stone-400" />
                        {dose.instructions}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {dose.status === 'taken' ? (
                  <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Taken at {dose.takenAt || 'Scheduled time'}</span>
                  </div>
                ) : dose.status === 'missed' ? (
                  <div className="flex items-center gap-1.5 bg-rose-100 text-rose-800 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-rose-300">
                    <X className="w-4 h-4 text-rose-600 stroke-[3]" />
                    <span>Missed</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markDoseAsTaken(dose.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Take Now</span>
                    </button>
                    <button
                      onClick={() => markDoseAsMissed(dose.id, 'Missed')}
                      className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Mark as missed"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to full medication management */}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm">
        <span className="text-stone-500">
          Missed doses automatically trigger an advisory alert to the care circle.
        </span>
        <a
          href="/medications"
          className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 hover:underline"
        >
          <span>Manage All Medications</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
