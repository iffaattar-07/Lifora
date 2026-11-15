'use client';

import React, { useState } from 'react';
import { 
  Pill, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  Utensils, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle,
  X,
  RefreshCw
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { Medication, MedicationForm, FoodRequirement } from '@/types';

export default function MedicationsPage() {
  const { medications, addMedication, deleteMedication, updateMedication, activeRole } = useCare();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    dosage: '',
    form: 'tablet' as MedicationForm,
    purpose: '',
    frequency: 'daily' as const,
    scheduleTime: '08:00 AM',
    withFood: 'with' as FoodRequirement,
    instructions: '',
    prescribingDoctor: 'Dr. Robert Hayes',
    refillCount: 30,
    totalQuantity: 30,
  });

  const filteredMeds = medications.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dosage) return;

    addMedication({
      name: formData.name,
      genericName: formData.genericName,
      dosage: formData.dosage,
      form: formData.form,
      color: '#2E847D',
      purpose: formData.purpose || 'General Maintenance',
      frequency: formData.frequency,
      scheduleTimes: [formData.scheduleTime],
      withFood: formData.withFood,
      instructions: formData.instructions || `Take 1 ${formData.form} with water`,
      prescribingDoctor: formData.prescribingDoctor,
      refillCount: Number(formData.refillCount),
      totalQuantity: Number(formData.totalQuantity),
      active: true,
      startDate: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setFormData({
      name: '',
      genericName: '',
      dosage: '',
      form: 'tablet',
      purpose: '',
      frequency: 'daily',
      scheduleTime: '08:00 AM',
      withFood: 'with',
      instructions: '',
      prescribingDoctor: 'Dr. Robert Hayes',
      refillCount: 30,
      totalQuantity: 30,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              Medication Management
            </h1>
            <span className="text-xs font-bold bg-teal-50 text-teal-900 px-3 py-1 rounded-full border border-teal-200">
              {medications.length} Prescriptions
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            Track daily dosages, prescription refills, food timing instructions and doctor notes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm px-5 py-3 rounded-2xl transition shadow-sm active:scale-98"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Medication</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by medication name, generic name or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-200 text-sm focus:border-teal-700 transition shadow-xs"
          />
        </div>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeds.map((med) => (
          <div
            key={med.id}
            className="bg-white rounded-3xl p-6 border border-sage-200/80 shadow-soft-card flex flex-col justify-between hover:border-teal-500/50 transition group"
          >
            <div>
              {/* Top card info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: med.color || '#2E847D' }}
                  >
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-lg leading-tight font-serif">
                      {med.name}
                    </h3>
                    {med.genericName && (
                      <p className="text-xs text-stone-500">{med.genericName}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                  {med.form}
                </span>
              </div>

              {/* Dosage & Purpose */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                  <span className="text-stone-500">Dosage</span>
                  <span className="font-bold text-stone-900">{med.dosage}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                  <span className="text-stone-500">Purpose</span>
                  <span className="font-semibold text-teal-900">{med.purpose}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                  <span className="text-stone-500">Schedule</span>
                  <span className="font-semibold text-stone-800">
                    {med.scheduleTimes.join(', ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-100">
                  <span className="text-stone-500">Food Requirement</span>
                  <span className="font-medium text-stone-700 capitalize">
                    {med.withFood} meals
                  </span>
                </div>
              </div>

              {/* Doctor and Instructions */}
              <div className="mt-4 p-3 bg-sage-50/70 rounded-xl border border-sage-200/70 text-xs text-stone-700">
                <p className="font-semibold text-teal-950">Instructions:</p>
                <p className="mt-0.5 leading-relaxed">{med.instructions}</p>
                <p className="text-[11px] text-stone-500 mt-2">
                  Prescribing Physician: <span className="font-medium text-stone-800">{med.prescribingDoctor}</span>
                </p>
              </div>

              {/* Refill status badge */}
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-stone-500">Refill Quantity:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    med.refillCount <= 7
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {med.refillCount} days left
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
              <button
                onClick={() => deleteMedication(med.id)}
                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="Delete medication"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Add New Medication</h3>
                  <p className="text-xs text-stone-500">Record a new prescription in Margaret&apos;s plan</p>
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
                  <label className="block text-xs font-bold text-stone-700 mb-1">Medication Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lisinopril"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Dosage *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 mg"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Form</label>
                  <select
                    value={formData.form}
                    onChange={(e) => setFormData({ ...formData, form: e.target.value as MedicationForm })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="liquid">Liquid</option>
                    <option value="inhaler">Inhaler</option>
                    <option value="injection">Injection</option>
                    <option value="drops">Drops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Primary Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. Blood Pressure"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">With Food</label>
                  <select
                    value={formData.withFood}
                    onChange={(e) => setFormData({ ...formData, withFood: e.target.value as FoodRequirement })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  >
                    <option value="with">With meals</option>
                    <option value="before">Before meals</option>
                    <option value="after">After meals</option>
                    <option value="anytime">Anytime / With water</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Instructions & Guidance</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with breakfast and a full glass of water."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Prescribing Doctor</label>
                  <input
                    type="text"
                    value={formData.prescribingDoctor}
                    onChange={(e) => setFormData({ ...formData, prescribingDoctor: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Initial Supply Days</label>
                  <input
                    type="number"
                    value={formData.refillCount}
                    onChange={(e) => setFormData({ ...formData, refillCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
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
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
