'use client';

import React from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function CaregiverAlertsPanel() {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useCare();

  const unresolvedAlerts = notifications.filter((n) => !n.isRead);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/90 shadow-soft-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-stone-900 font-serif">Care Alerts &amp; Exceptions</h3>
              {unresolvedAlerts.length > 0 && (
                <span className="text-[11px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300">
                  {unresolvedAlerts.length} Unresolved
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Automated safety escalations and prescription alerts</p>
          </div>

          {unresolvedAlerts.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs font-semibold text-teal-800 hover:text-teal-950 transition"
            >
              Acknowledge All
            </button>
          )}
        </div>

        {/* Alerts Stream */}
        <div className="mt-4 space-y-3">
          {notifications.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              onClick={() => markNotificationAsRead(alert.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                !alert.isRead
                  ? alert.severity === 'urgent'
                    ? 'bg-rose-50/80 border-rose-200'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50/80 border-amber-200'
                    : 'bg-teal-50/60 border-teal-200'
                  : 'bg-stone-50/60 border-stone-200/80'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {alert.severity === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                {alert.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {alert.severity === 'info' && <Clock className="w-4 h-4 text-blue-600" />}
                {alert.severity === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-900">{alert.title}</h4>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{alert.message}</p>

                {alert.actionLabel && alert.actionUrl && (
                  <a
                    href={alert.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-950 mt-2 hover:underline"
                  >
                    <span>{alert.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <span>Instant SMS alerts are active for all critical events.</span>
      </div>
    </div>
  );
}
