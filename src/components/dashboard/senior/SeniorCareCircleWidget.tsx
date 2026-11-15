'use client';

import React from 'react';
import { Users, Phone, Heart, ShieldCheck } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorCareCircleWidget() {
  const { careCircle, profile } = useCare();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sage-200/90 shadow-soft-card">
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif">Your Family &amp; Helpers</h3>
            <p className="text-xs text-stone-600">Always here with one tap</p>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        {careCircle.map((member) => (
          <div
            key={member.id}
            className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-900 text-teal-100 font-extrabold flex items-center justify-center text-base shadow-xs">
                {member.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-stone-900 text-base">{member.name}</h4>
                  {member.isEmergencyContact && (
                    <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 font-medium">
                  {member.relation} &bull; <span className="text-emerald-700 font-bold">{member.lastActive}</span>
                </p>
              </div>
            </div>

            <a
              href={`tel:${member.phone}`}
              className="flex items-center gap-1.5 bg-teal-800 hover:bg-teal-900 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition shadow-sm"
              title={`Call ${member.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-5 p-3.5 rounded-2xl bg-teal-50 border border-teal-200 flex items-center gap-2.5 text-xs text-teal-950 font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Sarah and David automatically see your medicine progress on their phones.</span>
      </div>
    </div>
  );
}
