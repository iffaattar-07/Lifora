'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Heart, 
  Bell, 
  UserPlus, 
  CheckCircle,
  X,
  PhoneCall
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { CaregiverRelation } from '@/types';

export default function CareCirclePage() {
  const { careCircle, addCareCircleMember, profile, triggerEmergencyAlert } = useCare();
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    relation: 'Daughter' as CaregiverRelation,
    role: 'family' as 'family' | 'caretaker',
    phone: '',
    email: '',
    isEmergencyContact: false,
    canManageMeds: true,
    receiveInstantAlerts: true,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    addCareCircleMember({
      name: formData.name,
      relation: formData.relation,
      role: formData.role,
      phone: formData.phone || '(503) 555-0100',
      email: formData.email,
      isEmergencyContact: formData.isEmergencyContact,
      canManageMeds: formData.canManageMeds,
      receiveInstantAlerts: formData.receiveInstantAlerts,
      lastActive: 'Just joined',
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
              Family &amp; Care Circle
            </h1>
            <span className="text-xs font-bold bg-teal-50 text-teal-900 px-3 py-1 rounded-full border border-teal-200">
              {careCircle.length} Members Active
            </span>
          </div>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            A secure, collaborative network ensuring Margaret is always supported by family members and home care specialists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm px-5 py-3 rounded-2xl transition shadow-sm active:scale-98"
          >
            <UserPlus className="w-5 h-5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Senior Profile Summary Card */}
      <div className="bg-gradient-to-r from-sage-100 via-teal-50 to-sage-50 rounded-3xl p-6 border border-sage-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-900 text-white flex items-center justify-center text-xl font-bold font-serif shadow-sm">
            MV
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900 font-serif">{profile.name}</h2>
              <span className="text-xs bg-white text-teal-900 font-bold px-2.5 py-0.5 rounded-full border border-stone-200">
                Care Recipient &bull; {profile.age} yrs
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Primary Physician: <span className="font-semibold text-stone-800">{profile.primaryDoctor.name}</span> ({profile.primaryDoctor.clinic})
            </p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              {profile.primaryCondition.map((cond) => (
                <span key={cond} className="bg-white/80 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <button
            onClick={() => triggerEmergencyAlert('Direct Test SOS from Care Circle Portal')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Test Circle Alert Broadcast</span>
          </button>
        </div>
      </div>

      {/* Circle Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {careCircle.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-3xl p-6 border border-sage-200/80 shadow-soft-card flex flex-col justify-between hover:border-teal-500/50 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-800 text-teal-100 font-bold flex items-center justify-center text-base shadow-xs">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{member.name}</h3>
                    <p className="text-xs text-stone-500">{member.relation}</p>
                  </div>
                </div>

                {member.isEmergencyContact && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    Emergency Primary
                  </span>
                )}
              </div>

              {/* Status and Contact Details */}
              <div className="mt-5 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <a href={`tel:${member.phone}`} className="font-semibold text-stone-900 hover:underline">
                    {member.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              {/* Permissions Pills */}
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Manage Medications</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Authorized
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Instant Missed Dose Alert</span>
                  <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Last Activity</span>
                  <span className="text-stone-500">{member.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="mt-6 pt-3 border-t border-stone-100 flex items-center justify-between">
              <a
                href={`tel:${member.phone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-50 hover:bg-teal-50 hover:text-teal-900 text-stone-700 rounded-xl text-xs font-bold border border-stone-200 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {member.name.split(' ')[0]}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-serif">Invite to Care Circle</h3>
                  <p className="text-xs text-stone-500">Connect a family member or caretaker</p>
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
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Vance"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Relationship</label>
                  <select
                    value={formData.relation}
                    onChange={(e) => setFormData({ ...formData, relation: e.target.value as CaregiverRelation })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  >
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Primary Caregiver">Primary Caregiver</option>
                    <option value="Home Nurse">Home Nurse</option>
                    <option value="Physician">Physician</option>
                    <option value="Neighbor">Neighbor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Access Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'family' | 'caretaker' })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  >
                    <option value="family">Family Member</option>
                    <option value="caretaker">Caretaker / Nurse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. (503) 555-0199"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. david.vance@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-teal-700"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEmergencyContact}
                    onChange={(e) => setFormData({ ...formData, isEmergencyContact: e.target.checked })}
                    className="rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <span className="text-xs text-stone-700 font-semibold">
                    Set as Primary Emergency Contact
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.receiveInstantAlerts}
                    onChange={(e) => setFormData({ ...formData, receiveInstantAlerts: e.target.checked })}
                    className="rounded text-teal-700 focus:ring-teal-700 w-4 h-4"
                  />
                  <span className="text-xs text-stone-700 font-semibold">
                    Send Instant Email &amp; SMS on missed doses or emergencies
                  </span>
                </label>
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
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
