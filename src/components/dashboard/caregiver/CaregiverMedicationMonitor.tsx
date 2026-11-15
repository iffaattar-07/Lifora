'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Check, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  CheckCircle2, 
  X, 
  Filter,
  Plus
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverMedicationMonitor() {
  const { todaySchedule, markDoseAsTaken, markDoseAsMissed } = useCare();
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken' | 'missed'>('all');

  const filteredDoses = todaySchedule.filter((d) => {
    if (filter === 'pending') return d.status === 'pending';
    if (filter === 'taken') return d.status === 'taken';
    if (filter === 'missed') return d.status === 'missed';
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/90 shadow-soft-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 font-serif">
              Medication Administration Audit
            </h2>
            <span className="text-xs font-bold bg-teal-50 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-200">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time verification status, timestamps and actors for each dose.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All ({todaySchedule.length})
          </button>
          <button
            onClick={() => setFilter('taken')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'taken' ? 'bg-white text-emerald-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Taken ({todaySchedule.filter((d) => d.status === 'taken').length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'pending' ? 'bg-white text-amber-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Pending ({todaySchedule.filter((d) => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === 'missed' ? 'bg-white text-rose-800 shadow-sm' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Missed ({todaySchedule.filter((d) => d.status === 'missed').length})
          </button>
        </div>
      </div>

      {/* Doses Table / List */}
      <div className="mt-5 divide-y divide-stone-100 overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="text-stone-400 font-bold uppercase text-[10px] tracking-wider pb-3">
              <th className="pb-3 font-semibold">Medication &amp; Dosage</th>
              <th className="pb-3 font-semibold">Scheduled</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Verified By / Updated</th>
              <th className="pb-3 font-semibold text-right">Caregiver Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredDoses.map((dose) => (
              <tr key={dose.id} className="hover:bg-stone-50/70 transition">
                {/* Medication Details */}
                <td className="py-4 pr-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: dose.color || '#2E847D' }}
                    >
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-900">{dose.medicationName}</p>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {dose.dosage} &bull; <span className="capitalize">{dose.form}</span>
                      </p>
                    </div>
                  </div>
                </td>

                {/* Scheduled Time */}
                <td className="py-4 pr-3">
                  <span className="inline-flex items-center gap-1 font-semibold text-stone-700 bg-stone-100 px-2 py-1 rounded-md text-xs">
                    <Clock className="w-3 h-3 text-stone-400" />
                    {dose.scheduledTime}
                  </span>
                </td>

                {/* Current Status */}
                <td className="py-4 pr-3">
                  {dose.status === 'taken' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Taken
                    </span>
                  ) : dose.status === 'missed' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Missed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pending
                    </span>
                  )}
                </td>

                {/* Who marked it & timestamp */}
                <td className="py-4 pr-3 text-xs">
                  {dose.status === 'taken' ? (
                    <div>
                      <p className="font-semibold text-stone-800 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {dose.recordedBy || 'Margaret Vance (Self)'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-0.5">
                        Recorded at {dose.takenAt || dose.updatedAt || '08:15 AM'}
                      </p>
                    </div>
                  ) : dose.status === 'missed' ? (
                    <div>
                      <p className="font-semibold text-rose-700">{dose.missedReason || 'Not recorded on time'}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{dose.updatedAt || 'Earlier today'}</p>
                    </div>
                  ) : (
                    <span className="text-stone-400 text-xs italic">Awaiting Margaret</span>
                  )}
                </td>

                {/* Caregiver Actions (Log on senior's behalf) */}
                <td className="py-4 text-right">
                  {dose.status === 'pending' ? (
                    <button
                      onClick={() => markDoseAsTaken(dose.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl transition shadow-xs"
                      title="Confirm on Margaret's behalf"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Log as Taken</span>
                    </button>
                  ) : (
                    <span className="text-stone-400 text-xs">Verified</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
