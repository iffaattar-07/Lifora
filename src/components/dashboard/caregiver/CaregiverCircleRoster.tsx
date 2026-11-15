'use client';

import React from 'react';
import { Users, Phone, Mail, Shield, UserPlus, ChevronRight } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverCircleRoster() {
  const { careCircle } = useCare();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Care Circle Team</h3>
              <span className="text-xs font-bold bg-teal-50 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                {careCircle.length} Connected
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Family members and visiting healthcare professionals</p>
          </div>

          <a
            href="/care-circle"
            className="flex items-center gap-1 text-xs font-bold text-teal-800 hover:text-teal-950 bg-sage-50 hover:bg-sage-100 px-3 py-1.5 rounded-xl border border-sage-200 transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </a>
        </div>

        {/* Member cards */}
        <div className="mt-4 space-y-3">
          {careCircle.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-stone-50/70 hover:bg-teal-50/30 border border-stone-200 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="font-bold text-stone-900 text-sm">{member.name}</h4>
                    {member.isEmergencyContact && (
                      <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded border border-rose-200">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {member.relation} &bull; <span className="text-emerald-700 font-medium">{member.lastActive}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`tel:${member.phone}`}
                  className="p-2 text-stone-600 hover:text-teal-900 hover:bg-white rounded-xl border border-transparent hover:border-stone-200 transition"
                  title={`Call ${member.name}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="p-2 text-stone-600 hover:text-teal-900 hover:bg-white rounded-xl border border-transparent hover:border-stone-200 transition"
                  title={`Email ${member.name}`}
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500">All members receive SMS on missed doses.</span>
        <a
          href="/care-circle"
          className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 hover:underline"
        >
          <span>Manage Permissions</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
