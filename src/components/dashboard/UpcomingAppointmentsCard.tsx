'use client';

import React from 'react';
import { 
  Calendar, 
  MapPin, 
  UserCheck, 
  Phone, 
  Clock, 
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function UpcomingAppointmentsCard() {
  const { appointments } = useCare();

  const nextAppointment = appointments[0];

  if (!nextAppointment) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card">
        <h3 className="text-lg font-bold text-stone-900 font-serif">Upcoming Appointments</h3>
        <p className="text-sm text-stone-500 mt-2">No appointments scheduled.</p>
      </div>
    );
  }

  const formattedDate = new Date(nextAppointment.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Next Doctor Appointment</h3>
            <p className="text-xs text-stone-500">Coordinated with family escort</p>
          </div>
          <span className="p-2 bg-teal-50 text-teal-800 rounded-xl">
            <Calendar className="w-5 h-5" />
          </span>
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-stone-900 text-base">{nextAppointment.doctorName}</h4>
              <p className="text-xs font-semibold text-teal-900">{nextAppointment.specialty}</p>
              <p className="text-xs text-stone-500 mt-0.5">{nextAppointment.facility}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <p className="text-[10px] text-stone-400 font-semibold uppercase">Date & Time</p>
                <p className="font-bold text-stone-900">{formattedDate} &bull; {nextAppointment.time}</p>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-xl border border-stone-200/80 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="text-[10px] text-stone-400 font-semibold uppercase">Escort</p>
                <p className="font-bold text-stone-900 truncate">
                  {nextAppointment.assignedEscort || 'Companion Confirmed'}
                </p>
              </div>
            </div>
          </div>

          {nextAppointment.notes && (
            <p className="mt-3 text-xs text-stone-600 bg-white/80 p-2.5 rounded-xl border border-stone-200/60 italic">
              Note: &ldquo;{nextAppointment.notes}&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <a
          href={`tel:${nextAppointment.contactNumber}`}
          className="flex items-center gap-1.5 font-bold text-teal-800 hover:text-teal-950 transition"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call Clinic: {nextAppointment.contactNumber}</span>
        </a>

        <a
          href="/appointments"
          className="font-bold text-stone-600 hover:text-teal-900 flex items-center gap-0.5 hover:underline"
        >
          <span>All Visits ({appointments.length})</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
