'use client';

import React from 'react';
import { 
  Calendar, 
  UserCheck, 
  Phone, 
  MapPin, 
  Clock, 
  Plus, 
  ChevronRight,
  Stethoscope,
  Car
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverAppointmentsManager() {
  const { appointments } = useCare();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Clinical Visits &amp; Escorts</h3>
              <span className="text-xs font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                {appointments.length} Scheduled
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Transportation and family accompaniment tracking</p>
          </div>

          <a
            href="/appointments"
            className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 bg-sage-50 hover:bg-sage-100 px-3 py-1.5 rounded-xl border border-sage-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Visit</span>
          </a>
        </div>

        {/* Appointment Cards */}
        <div className="mt-4 space-y-3.5">
          {appointments.slice(0, 2).map((apt) => {
            const formattedDate = new Date(apt.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={apt.id}
                className="p-4 rounded-2xl bg-stone-50/80 hover:bg-teal-50/40 border border-stone-200 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{apt.doctorName}</h4>
                      <p className="text-xs font-semibold text-teal-900">{apt.specialty}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">{apt.facility}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                      {formattedDate}
                    </span>
                    <p className="text-[11px] font-bold text-stone-500 mt-1">{apt.time}</p>
                  </div>
                </div>

                {/* Escort & Clinic Contact Line */}
                <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <Car className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Escort: {apt.assignedEscort || 'Companion Required'}</span>
                  </span>

                  <a
                    href={`tel:${apt.contactNumber}`}
                    className="flex items-center gap-1 text-stone-600 hover:text-teal-900 font-semibold"
                  >
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{apt.contactNumber}</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500">Sarah Vance confirmed as primary driver.</span>
        <a
          href="/appointments"
          className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 hover:underline"
        >
          <span>View All Visits</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
