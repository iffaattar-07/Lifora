'use client';

import React from 'react';
import { Pill, Check, Clock, Utensils, ThumbsUp } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorTodaySchedule() {
  const { todaySchedule, markDoseAsTaken } = useCare();

  const totalDoses = todaySchedule.length;
  const takenDoses = todaySchedule.filter((d) => d.status === 'taken').length;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-sage-200/90 shadow-soft-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold text-stone-900 font-serif">Today&apos;s Pill Routine</h2>
            <span className="text-xs font-extrabold bg-teal-100 text-teal-950 px-3 py-1 rounded-full border border-teal-300">
              {takenDoses} of {totalDoses} Taken
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1">
            Tap the green checkmark as soon as you take each pill.
          </p>
        </div>
      </div>

      {/* Doses List */}
      <div className="mt-5 space-y-4">
        {todaySchedule.map((dose) => (
          <div
            key={dose.id}
            className={`p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              dose.status === 'taken'
                ? 'bg-emerald-50/60 border-emerald-300'
                : dose.status === 'missed'
                ? 'bg-rose-50/50 border-rose-200'
                : 'bg-white hover:bg-stone-50 border-stone-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: dose.color || '#2E847D' }}
              >
                <Pill className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    {dose.medicationName}
                  </h3>
                  <span className="text-sm font-bold text-stone-700 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-300">
                    {dose.dosage}
                  </span>
                </div>

                <p className="text-xs font-semibold text-teal-900 mt-0.5">
                  For: {dose.purpose || 'Health Maintenance'}
                </p>

                <div className="flex items-center gap-3 text-xs text-stone-600 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    Scheduled: {dose.scheduledTime}
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

            {/* Action State */}
            <div className="self-end sm:self-center shrink-0">
              {dose.status === 'taken' ? (
                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-900 px-4 py-2 rounded-xl text-sm font-extrabold border-2 border-emerald-300">
                  <Check className="w-5 h-5 text-emerald-700 stroke-[3]" />
                  <span>Taken at {dose.takenAt || 'Morning'}</span>
                </div>
              ) : (
                <button
                  onClick={() => markDoseAsTaken(dose.id)}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition shadow-md border-2 border-emerald-500 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Mark as Taken</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
