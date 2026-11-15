'use client';

import React from 'react';
import { Calendar, UserCheck, Phone, Stethoscope, MapPin, Clock } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorAppointmentsCard() {
  const { appointments } = useCare();
  const nextApt = appointments[0];

  if (!nextApt) {
    return (
      <div className="bg-white rounded-3xl p-6 border-2 border-sage-200/90 shadow-soft-card">
        <h3 className="text-xl font-bold text-stone-900 font-serif">Upcoming Doctor Visits</h3>
        <p className="text-sm text-stone-500 mt-2">No visits scheduled right now.</p>
      </div>
    );
  }

  const dateFormatted = new Date(nextApt.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sage-200/90 shadow-soft-card">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">Next Doctor Visit</h3>
            <p className="text-xs text-stone-600">With companion confirmed</p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-5 rounded-2xl bg-teal-50/70 border-2 border-teal-200/70 space-y-3">
        <div>
          <h4 className="text-xl font-extrabold text-stone-900 font-serif">
            {nextApt.doctorName}
          </h4>
          <p className="text-sm font-bold text-teal-900">{nextApt.specialty}</p>
          <p className="text-xs text-stone-600 mt-0.5">{nextApt.facility}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="bg-white p-3 rounded-xl border border-stone-300 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">When</p>
              <p className="font-extrabold text-stone-900">{dateFormatted} at {nextApt.time}</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-300 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Companion</p>
              <p className="font-extrabold text-stone-900 truncate">
                {nextApt.assignedEscort || 'Sarah Vance'}
              </p>
            </div>
          </div>
        </div>

        {nextApt.notes && (
          <div className="p-3 bg-white/90 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed italic">
            &ldquo;{nextApt.notes}&rdquo;
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <a
            href={`tel:${nextApt.contactNumber}`}
            className="flex items-center gap-2 text-xs font-extrabold text-teal-900 hover:text-teal-950 bg-white px-3.5 py-2 rounded-xl border border-teal-300 shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 text-teal-700" />
            <span>Call Clinic: {nextApt.contactNumber}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
