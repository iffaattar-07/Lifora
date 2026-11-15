'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Pill, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  Volume2, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function UpcomingDoseCard() {
  const { todaySchedule, markDoseAsTaken, markDoseAsMissed } = useCare();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Find next pending dose or most recently scheduled pending dose
  const nextDose = todaySchedule.find((d) => d.status === 'pending');

  const handleSpeakInstructions = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower, clear cadence for elderly comprehension
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(text);
    }
  };

  if (!nextDose) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">All Up To Date!</h3>
            <p className="text-sm text-stone-500 mt-0.5">
              No pending medications for right now. Next doses will resume according to Margaret&apos;s schedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const audioPrompt = `Please take ${nextDose.medicationName}, ${nextDose.dosage}. Scheduled for ${nextDose.scheduledTime}. ${nextDose.instructions || ''}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-sage-300/80 shadow-soft-card relative overflow-hidden">
      {/* Top Banner indicating Urgent/Next Dose */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
            <span>Next Medication Due: {nextDose.scheduledTime}</span>
          </span>
          <span className="text-xs text-stone-500 hidden sm:inline">&bull; Midday Dose</span>
        </div>

        {/* Read aloud helper for elderly accessibility */}
        <button
          onClick={() => handleSpeakInstructions(audioPrompt)}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg transition ${
            isPlayingAudio
              ? 'bg-teal-700 text-white animate-pulse'
              : 'bg-sage-100 hover:bg-sage-200 text-teal-900'
          }`}
          title="Listen to dosage instructions"
        >
          <Volume2 className="w-4 h-4" />
          <span>{isPlayingAudio ? 'Reading Aloud...' : 'Read Aloud'}</span>
        </button>
      </div>

      {/* Main Medication Information */}
      <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: nextDose.color || '#2E847D' }}
          >
            <Pill className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-bold text-stone-900 tracking-tight font-serif">
                {nextDose.medicationName}
              </h3>
              <span className="text-base font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-lg border border-stone-200">
                {nextDose.dosage}
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {nextDose.form}
              </span>
            </div>

            {nextDose.purpose && (
              <p className="text-sm font-medium text-stone-600 mt-1">
                Purpose: <span className="text-teal-900 font-semibold">{nextDose.purpose}</span>
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-stone-600 bg-sage-50/80 px-3 py-1.5 rounded-xl border border-sage-200 max-w-xl">
              <Utensils className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                {nextDose.instructions || 'Take with water as directed by your physician.'}
              </span>
            </div>
          </div>
        </div>

        {/* Big Action Buttons - Senior Accessibility Optimized */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0 justify-end">
          <button
            onClick={() => markDoseAsTaken(nextDose.id)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base px-6 py-3.5 rounded-2xl transition shadow-md shadow-emerald-700/20 active:scale-98"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Took This Now</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => markDoseAsMissed(nextDose.id, 'Missed dose recorded by user')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 text-xs font-semibold py-2.5 px-3 rounded-xl border border-stone-200 hover:border-rose-200 transition"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Missed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
