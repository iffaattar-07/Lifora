'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  UserCheck, 
  Phone, 
  Clock, 
  Stethoscope, 
  CheckCircle, 
  X,
  FileText
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { Appointment } from '@/types';

export default function AppointmentsPage() {
  const { appointments, addAppointment, careCircle } = useCare();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    doctorName: '',
    specialty: '',
    facility: '',
    address: '',
    date: '2026-11-20',
    time: '10:00 AM',
    notes: '',
    contactNumber: '(503) 555-0144',
    requiresEscort: true,
    assignedEscort: 'Sarah Vance (Daughter)',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doctorName || !formData.facility) return;

    addAppointment({
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      facility: formData.facility,
      address: formData.address,
      date: formData.date,
      time: formData.time,
      notes: formData.notes,
      contactNumber: formData.contactNumber,
      requiresEscort: formData.requiresEscort,
      assignedEscort: formData.assignedEscort,
      status: 'upcoming',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              Doctor Appointments &amp; Visits
            </h1>
            <span className="text-xs font-bold bg-teal-50 text-teal-900 px-3 py-1 rounded-full border border-teal-200">
              {appointments.length} Scheduled
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Coordinate clinical visits, transport escorts, clinic phone lines and preparation instructions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm px-5 py-3 rounded-2xl transition shadow-sm active:scale-98"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule New Appointment</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-teal-500/40 transition"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 shadow-xs border border-teal-100">
                <Stethoscope className="w-7 h-7" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-stone-900 font-serif">
                    {apt.doctorName}
                  </h3>
                  <span className="text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                    {apt.specialty}
                  </span>
                </div>

                <p className="text-sm text-stone-600 mt-1 font-medium">{apt.facility}</p>
                <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{apt.address}</span>
                </p>

                {apt.notes && (
                  <div className="mt-3 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs text-stone-600 flex items-start gap-2 max-w-2xl">
                    <FileText className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                    <span>Prep Instructions: {apt.notes}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 shrink-0">
              <div className="bg-sage-50/80 px-4 py-2.5 rounded-2xl border border-sage-200/80 text-right">
                <div className="flex items-center gap-1.5 text-xs text-teal-900 font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-extrabold text-stone-900 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{apt.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Escort: {apt.assignedEscort || 'Family companion'}</span>
                </span>
                <a
                  href={`tel:${apt.contactNumber}`}
                  className="p-2 bg-stone-100 hover:bg-teal-50 text-stone-700 hover:text-teal-900 rounded-xl transition border border-stone-200"
                  title="Call clinic"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Schedule Appointment</h3>
                  <p className="text-xs text-stone-500">Record a doctor visit for Margaret Vance</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Physician Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Robert Hayes"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    placeholder="e.g. Geriatric Cardiology"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Facility / Hospital *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude Health & Wellness Pavilion"
                  value={formData.facility}
                  onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 1100 NW Medical Dr, Suite 304, Portland, OR"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={formData.time}
                    placeholder="e.g. 10:30 AM"
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Clinic Phone</label>
                  <input
                    type="text"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Assigned Escort</label>
                  <input
                    type="text"
                    value={formData.assignedEscort}
                    onChange={(e) => setFormData({ ...formData, assignedEscort: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preparation Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring updated medication list. Fasting required."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                />
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-sm transition"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
