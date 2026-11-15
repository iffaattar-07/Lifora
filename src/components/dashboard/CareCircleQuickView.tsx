'use client';

import React from 'react';
import { Users, Phone, Shield, ChevronRight, MessageSquareHeart } from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CareCircleQuickView() {
  const { careCircle } = useCare();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">Family &amp; Care Circle</h3>
            <p className="text-xs text-stone-500">Connected &amp; actively monitoring</p>
          </div>
          <span className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
            <Users className="w-5 h-5" />
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {careCircle.map((member) => (
            <div
              key={member.id}
              className="p-3.5 rounded-2xl bg-stone-50/70 hover:bg-sage-50/50 border border-stone-200/70 flex items-center justify-between gap-3 transition"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-100 font-bold flex items-center justify-center text-sm shadow-xs">
                    {member.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
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

              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${member.phone}`}
                  className="p-2 text-stone-600 hover:text-teal-900 hover:bg-white rounded-xl border border-transparent hover:border-stone-200 transition"
                  title={`Call ${member.name}`}
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
        <span className="text-stone-500">All members receive instant SMS on missed critical meds.</span>
        <a
          href="/care-circle"
          className="font-bold text-teal-800 hover:text-teal-950 flex items-center gap-0.5 hover:underline"
        >
          <span>Manage Circle</span>
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
