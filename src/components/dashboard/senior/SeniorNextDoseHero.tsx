'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  Pill, 
  CheckCircle, 
  XCircle, 
  Utensils, 
  Volume2, 
  Sparkles, 
  Check, 
  ThumbsUp
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function SeniorNextDoseHero() {
  const { todaySchedule, markDoseAsTaken, markDoseAsMissed, profile } = useCare();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Find the single next pending dose
  const nextDose = todaySchedule.find((d) => d.status === 'pending');

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85; // Slower cadence for elderly comfort
      utterance.pitch = 1.0;
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
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sage-50 rounded-3xl p-7 sm:p-9 border-2 border-emerald-300 shadow-soft-card flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <ThumbsUp className="w-10 h-10" />
        </div>
        <div>
          <span className="inline-block bg-emerald-200/80 text-emerald-950 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-300 mb-2">
            All Doses Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            You&apos;re All Done for Today, {profile.preferredName}!
          </h2>
          <p className="text-base text-stone-700 mt-1 max-w-xl leading-relaxed">
            Every scheduled medication has been taken. Sarah and your care team have been notified. Enjoy a peaceful evening!
          </p>
        </div>
      </div>
    );
  }

  const audioPrompt = `Hello ${profile.preferredName}. It is time to take ${nextDose.medicationName}, ${nextDose.dosage}. This is scheduled for ${nextDose.scheduledTime}. ${nextDose.instructions || 'Please take it with a full glass of water.'}`;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-9 border-2 border-teal-600/70 shadow-elevated relative overflow-hidden">
      {/* Top Banner Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-950 text-sm font-bold px-4 py-1.5 rounded-full border-2 border-amber-300 shadow-xs">
            <Clock className="w-4 h-4 text-amber-800 animate-spin-slow" />
            <span>Next Medication Due: {nextDose.scheduledTime}</span>
          </span>
        </div>

        {/* Read aloud senior voice button */}
        <button
          onClick={() => handleSpeak(audioPrompt)}
          className={`flex items-center justify-center gap-2 text-sm font-bold px-4 py-2 rounded-2xl transition border-2 shadow-xs ${
            isPlayingAudio
              ? 'bg-teal-700 text-white border-teal-800 animate-pulse'
              : 'bg-sage-100 hover:bg-sage-200 text-teal-950 border-sage-300'
          }`}
          title="Click to hear instructions spoken aloud"
        >
          <Volume2 className="w-5 h-5" />
          <span>{isPlayingAudio ? 'Reading Aloud...' : 'Read Aloud to Me'}</span>
        </button>
      </div>

      {/* Main Medication Hero Presentation */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-5">
          {/* High visibility pill badge */}
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-md ring-4 ring-white"
            style={{ backgroundColor: nextDose.color || '#2E847D' }}
          >
            <Pill className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif">
                {nextDose.medicationName}
              </h2>
              <span className="text-lg font-bold text-stone-800 bg-stone-100 px-3.5 py-1 rounded-xl border border-stone-300">
                {nextDose.dosage}
              </span>
              <span className="text-xs uppercase font-extrabold tracking-wider text-teal-900 bg-teal-50 px-3 py-1 rounded-lg border border-teal-300">
                {nextDose.form}
              </span>
            </div>

            {nextDose.purpose && (
              <p className="text-base font-semibold text-stone-700">
                Prescribed for:{' '}
                <span className="text-teal-900 font-bold">{nextDose.purpose}</span>
              </p>
            )}

            <div className="flex items-start gap-2.5 bg-sage-50 p-3.5 rounded-2xl border border-sage-200 max-w-xl text-stone-800 text-sm sm:text-base font-medium">
              <Utensils className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
              <span>
                {nextDose.instructions || 'Take with water and your meal as instructed by your doctor.'}
              </span>
            </div>
          </div>
        </div>

        {/* Big Action Buttons - Senior Accessibility Optimized */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0 justify-end w-full lg:w-64">
          <button
            onClick={() => markDoseAsTaken(nextDose.id)}
            className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-lg px-8 py-5 rounded-2xl transition shadow-lg shadow-emerald-700/25 border-2 border-emerald-500 cursor-pointer"
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span>I Took This Now</span>
          </button>

          <button
            onClick={() => markDoseAsMissed(nextDose.id, 'Missed dose recorded')}
            className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-600 font-bold text-sm py-3 px-4 rounded-xl border border-stone-300 hover:border-rose-300 transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Mark as Missed</span>
          </button>
        </div>
      </div>
    </div>
  );
}
