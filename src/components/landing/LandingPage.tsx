'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Heart, 
  Pill, 
  Calendar, 
  Users, 
  Sparkles, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Volume2, 
  ChevronRight, 
  Eye, 
  HeartHandshake,
  UserCheck,
  Stethoscope,
  Smile,
  Shield,
  Zap,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCare, DEMO_ACCOUNTS } from '@/context/CareContext';
import { DemoLoginModal } from '@/components/auth/DemoLoginModal';

export function LandingPage() {
  const { loginDemo, isLoginModalOpen, setIsLoginModalOpen } = useCare();

  const [activeTab, setActiveTab] = useState<'senior' | 'caregiver'>('senior');
  const [interactiveTaken, setInteractiveTaken] = useState(false);
  const [safeguardQuery, setSafeguardQuery] = useState('');
  const [safeguardResponse, setSafeguardResponse] = useState<string | null>(null);
  const [isSafeguardTriggered, setIsSafeguardTriggered] = useState(false);

  const handleHeroInteractiveTaken = () => {
    setInteractiveTaken(true);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2E847D', '#69957F', '#10B981'],
      });
    } catch {}
  };

  const handleTestSafeguard = (query: string) => {
    setSafeguardQuery(query);
    const q = query.toLowerCase();

    if (q.includes('double') || q.includes('change dose') || q.includes('diagnose')) {
      setIsSafeguardTriggered(true);
      setSafeguardResponse(
        "🛡️ Safety Safeguard Triggered: Lifora cannot recommend modifying prescribed dosages, doubling up on missed doses, or making medical diagnoses. Please immediately contact prescribing physician Dr. Robert Hayes at (503) 555-0144 or daughter Sarah Vance."
      );
    } else if (q.includes('pill') || q.includes('left') || q.includes('medication')) {
      setIsSafeguardTriggered(false);
      setSafeguardResponse(
        "Margaret, you have 3 doses remaining today: Glucosamine Sulfate (750 mg) at 01:00 PM, and Metformin (500 mg) with Lisinopril (10 mg) at 08:00 PM."
      );
    } else {
      setIsSafeguardTriggered(false);
      setSafeguardResponse(
        "Your next clinical appointment is with Dr. Robert Hayes (Cardiology) on Wednesday, Nov 18 at 10:30 AM. Sarah Vance is confirmed as your escort companion."
      );
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 -mt-6 sm:-mt-8">
      {/* Demo Login Modal */}
      <DemoLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/50 via-sage-100/30 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center px-4">
          {/* Tagline / Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 bg-teal-900/90 text-teal-100 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm mb-6 border border-teal-700/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Intelligent Elderly Care &amp; Wellness Platform</span>
          </div>

          {/* Primary Tagline Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold text-teal-950 tracking-tight leading-[1.12]">
            Making every day <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-800 via-teal-600 to-emerald-700">
              healthier, together.
            </span>
          </h1>

          {/* Emotional Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
            LIFORA connects seniors, their families, and dedicated caregivers into one coordinated circle. 
            Enjoy effortless medication adherence, doctor escort planning, safety-guarded AI support, and instant reassurance.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 text-base group"
            >
              <span>Explore Demo Accounts</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => loginDemo('senior')}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-sage-50 text-teal-950 font-bold rounded-2xl border-2 border-sage-300/80 shadow-md transition-all flex items-center justify-center gap-2 text-base"
            >
              <UserCheck className="w-5 h-5 text-teal-700" />
              <span>Launch Senior View (Margaret)</span>
            </button>
          </div>

          {/* Verified Badges */}
          <div className="mt-10 pt-6 border-t border-sage-200/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-stone-500 font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Clinical Safety Safeguards</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>92% Adherence Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>Instant Emergency SOS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Context-Aware AI Companion</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Visual Collage */}
        <div className="mt-12 max-w-6xl mx-auto px-4">
          <div className="relative rounded-3xl bg-gradient-to-b from-stone-900 to-teal-950 p-4 sm:p-8 shadow-2xl border border-teal-800/40 text-white overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#2E847D_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Senior Perspective Interactive Card */}
              <div className="lg:col-span-7 bg-white/95 text-stone-900 rounded-2xl p-6 sm:p-7 shadow-xl border border-sage-200">
                <div className="flex items-center justify-between pb-4 border-b border-sage-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-serif font-bold text-lg">
                      MV
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        Senior View Experience
                      </span>
                      <h3 className="font-serif font-bold text-lg text-stone-900">Good morning, Margaret!</h3>
                    </div>
                  </div>

                  <button className="flex items-center gap-1 text-xs text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full font-medium transition">
                    <Volume2 className="w-4 h-4 text-teal-700" />
                    <span className="hidden sm:inline">Read Aloud</span>
                  </button>
                </div>

                {/* Next Dose Preview Card */}
                <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-teal-50 via-sage-50 to-ivory-100 border-2 border-teal-600/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase text-teal-800 tracking-wide">
                      Next Scheduled Medication
                    </span>
                    <span className="text-xs font-bold text-teal-900 bg-white px-2.5 py-1 rounded-full shadow-xs">
                      Today &bull; 08:00 AM
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-md">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-stone-900 font-serif">Lisinopril 10 mg</h4>
                      <p className="text-xs text-stone-600">Blood Pressure &bull; Take with a full glass of water with breakfast</p>
                    </div>
                  </div>

                  {/* Interactive Button */}
                  <div className="mt-5 flex items-center gap-3">
                    <button
                      onClick={handleHeroInteractiveTaken}
                      disabled={interactiveTaken}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                        interactiveTaken
                          ? 'bg-emerald-600 text-white'
                          : 'bg-teal-800 hover:bg-teal-900 text-white hover:scale-[1.01]'
                      }`}
                    >
                      {interactiveTaken ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                          <span>Dose Recorded as Taken! (100% Today)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          <span>I Took This Now (Click to test)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Live Adherence Bar */}
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-sage-100">
                    <div className="text-lg font-bold text-teal-900">{interactiveTaken ? '100%' : '83%'}</div>
                    <div className="text-[11px] text-stone-500 font-medium">Today Adherence</div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-sage-100">
                    <div className="text-lg font-bold text-teal-900">5 Days</div>
                    <div className="text-[11px] text-stone-500 font-medium">Active Streak</div>
                  </div>
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-sage-100">
                    <div className="text-lg font-bold text-emerald-700">Protected</div>
                    <div className="text-[11px] text-stone-500 font-medium">Care Circle Live</div>
                  </div>
                </div>
              </div>

              {/* Daughter & Care Circle Synchronized Overview */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-teal-900/90 rounded-2xl p-5 border border-teal-700/50 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=128" 
                      alt="Sarah Vance"
                      className="w-11 h-11 rounded-full object-cover border-2 border-teal-400"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-ivory-50">Sarah Vance (Daughter)</h4>
                      <p className="text-xs text-teal-300">Caregiver Coordination Feed</p>
                    </div>
                  </div>

                  <div className="bg-teal-950/70 p-3.5 rounded-xl border border-teal-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-teal-300">
                      <span className="font-medium">Margaret's Care Status</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                        Synchronized
                      </span>
                    </div>
                    <p className="text-stone-300 text-[11px] leading-relaxed">
                      {interactiveTaken 
                        ? '✓ Sarah received instant alert: "Margaret confirmed Lisinopril 10 mg at 08:00 AM."'
                        : 'Awaiting 08:00 AM Lisinopril dose confirmation. Escort scheduled for Wednesday cardiology visit.'}
                    </p>
                  </div>
                </div>

                {/* Quick Doctor Visit Preview */}
                <div className="bg-teal-900/60 rounded-2xl p-4 border border-teal-800/40 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-teal-800 flex items-center justify-center text-teal-200">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-ivory-100">Dr. Robert Hayes, MD</div>
                      <div className="text-[11px] text-teal-300">Cardiology &bull; Wed, Nov 18</div>
                    </div>
                  </div>
                  <span className="bg-teal-800 text-teal-100 text-[10px] px-2 py-1 rounded font-bold">
                    Escort Confirmed
                  </span>
                </div>

                {/* Demo Switch Action */}
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => loginDemo('senior')}
                    className="flex-1 py-2.5 px-3 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Log in as Margaret</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => loginDemo('caregiver')}
                    className="flex-1 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <span>Log in as Sarah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DEMO LOGIN FEATURED SPOTLIGHT SECTION                     */}
      {/* ============================================================ */}
      <section id="demo-accounts" className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-ivory-100 via-white to-sage-50 rounded-3xl p-6 sm:p-10 border border-sage-200 shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-3 py-1 rounded-full border border-teal-200">
              Immediate Evaluation Ready
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teal-950 mt-3">
              Experience Both Perspectives
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-2">
              LIFORA provides two purpose-built dashboard layouts. Click below to test either role with pre-populated clinical data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Senior Demo Account Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-teal-600/30 shadow-lg hover:shadow-xl transition-all relative flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-teal-100 text-teal-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Senior View
              </div>

              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160"
                    alt="Margaret Vance"
                    className="w-14 h-14 rounded-full object-cover border-2 border-teal-600"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-xl text-stone-900">Margaret Vance</h3>
                    <p className="text-xs text-teal-700 font-medium">Care Recipient &bull; 78 Years Old</p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Designed specifically for seniors with large, readable fonts, 1-touch medication confirmations, simplified calendar view, and direct emergency call buttons.
                </p>

                {/* Preloaded Credentials Box */}
                <div className="bg-sage-50/80 rounded-xl p-3.5 border border-sage-200 text-xs font-mono space-y-1.5 text-stone-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Email:</span>
                    <span className="font-bold text-teal-900">margaret@lifora.demo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Password:</span>
                    <span className="font-bold text-teal-900">Margaret@123</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sage-200/60 text-[11px] text-stone-500 font-sans">
                    <span>Role Experience:</span>
                    <span className="text-teal-800 font-bold">Personal Care Dashboard</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loginDemo('senior')}
                className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Auto-fill &amp; Open Senior View</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Family & Caregiver Demo Account Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-amber-500/30 shadow-lg hover:shadow-xl transition-all relative flex flex-col justify-between">
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Caregiver View
              </div>

              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=160"
                    alt="Sarah Vance"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-600"
                  />
                  <div>
                    <h3 className="font-serif font-bold text-xl text-stone-900">Sarah Vance</h3>
                    <p className="text-xs text-amber-700 font-medium">Daughter &amp; Primary Coordinator</p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  Built for adult children and caregivers to coordinate care across the family circle: detailed adherence analytics, missed-dose watchdog alerts, and escort management.
                </p>

                {/* Preloaded Credentials Box */}
                <div className="bg-sage-50/80 rounded-xl p-3.5 border border-sage-200 text-xs font-mono space-y-1.5 text-stone-700 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Email:</span>
                    <span className="font-bold text-teal-900">sarah@lifora.demo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400">Password:</span>
                    <span className="font-bold text-teal-900">Sarah@123</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sage-200/60 text-[11px] text-stone-500 font-sans">
                    <span>Role Experience:</span>
                    <span className="text-amber-800 font-bold">Care Coordination Dashboard</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => loginDemo('caregiver')}
                className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-sm transition shadow-md flex items-center justify-center gap-2 group"
              >
                <span>Auto-fill &amp; Open Caregiver View</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs font-bold text-teal-800 hover:text-teal-950 underline decoration-teal-400 underline-offset-4 transition"
            >
              Want to manually type custom credentials? Open Interactive Login Form &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SHOWCASE OF 5 CORE PRODUCT FEATURES                       */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Intelligent Care Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-teal-950 mt-3">
            Built for Real-World Caregiving
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            Every module in LIFORA has been designed from clinical interviews with seniors, gerontologists, and family caregivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-7 border border-sage-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">1. Precision Medication Tracking</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              Daily dose slots generated automatically. Track pill shapes, colors, meal requirements (&ldquo;Take WITH food&rdquo;), refill counts, and adherence metrics with 1 touch.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-sage-100 pt-3">
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Inventory decrement upon dose taken</span>
              </li>
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Low refill pharmacy alert warnings</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-7 border border-sage-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">2. Connected Care Circle</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              Bring adult children, home nurses, and doctors together into a shared care network. Manage member roles, instant emergency contacts, and alert settings.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-sage-100 pt-3">
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Realtime Supabase WebSocket sync</span>
              </li>
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Caregiver medication audit attribution</span>
              </li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-7 border border-sage-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">3. Appointments &amp; Escorts</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              Keep clinic visits organized with doctor credentials, clinic phone dialing, preparation notes, and designated escort companions (&ldquo;Sarah Vance confirmed&rdquo;).
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-sage-100 pt-3">
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Assigned escort confirmation</span>
              </li>
              <li className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                <span>Preparation notes &amp; clinic contacts</span>
              </li>
            </ul>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-7 border border-teal-600/40 shadow-md hover:shadow-lg transition lg:col-span-2">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-teal-900 text-teal-200 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase bg-teal-100 text-teal-900 px-2.5 py-1 rounded-full">
                Patent-Pending Architecture
              </span>
            </div>

            <h3 className="font-serif font-bold text-2xl text-stone-900 mb-2">
              4. Context-Aware AI Care Assistant with Clinical Safeguards
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              Unlike generic chatbots, the Lifora Assistant reads actual database prescriptions, appointment schedules, and food rules. 
              Most importantly, it incorporates an immutable <strong>Medical Safeguard Filter</strong> that strictly blocks dosage tampering, double-dose suggestions, or medical diagnosis requests.
            </p>

            {/* Mini Interactive Safeguard Demo */}
            <div className="bg-stone-50 p-4 rounded-xl border border-sage-200 text-xs space-y-2.5">
              <div className="font-bold text-stone-700">Test the Clinical Safeguard Filter live:</div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTestSafeguard('Can I take a double dose of Lisinopril?')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 rounded-lg font-medium transition"
                >
                  &ldquo;Can I double my dose?&rdquo; (Unsafe)
                </button>
                <button
                  onClick={() => handleTestSafeguard('What pills are left for today?')}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 rounded-lg font-medium transition"
                >
                  &ldquo;What pills are left today?&rdquo; (Context)
                </button>
                <button
                  onClick={() => handleTestSafeguard('When is my next doctor appointment?')}
                  className="px-2.5 py-1 bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 rounded-lg font-medium transition"
                >
                  &ldquo;Next doctor appointment?&rdquo; (Visit)
                </button>
              </div>

              {safeguardResponse && (
                <div className={`p-3 rounded-lg border text-xs leading-relaxed animate-in fade-in duration-200 ${
                  isSafeguardTriggered 
                    ? 'bg-rose-50 border-rose-200 text-rose-900' 
                    : 'bg-teal-50 border-teal-200 text-teal-950'
                }`}>
                  {safeguardResponse}
                </div>
              )}
            </div>
          </div>

          {/* Feature 5 */}
          <div className="bg-gradient-to-br from-rose-50 to-white rounded-2xl p-7 border border-rose-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-5">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl text-stone-900 mb-2">5. Emergency Support &amp; SOS</h3>
            <p className="text-stone-600 text-sm leading-relaxed mb-4">
              Single-touch emergency distress call transmitting GPS location and immediate alerts across in-app broadcasts and cellular SMS simulators.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 border-t border-rose-100 pt-3">
              <li className="flex items-center gap-1.5 text-rose-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Simultaneous Care Circle dispatch</span>
              </li>
              <li className="flex items-center gap-1.5 text-rose-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>GPS coordinates snapshot</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CLINICAL PERSPECTIVE & TESTIMONIALS                       */}
      {/* ============================================================ */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-teal-950 text-white rounded-3xl p-8 sm:p-12 border border-teal-800 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-900/80 px-3 py-1 rounded-full border border-teal-700">
              Geriatric Care Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ivory-50 mt-4 leading-snug">
              &ldquo;LIFORA removes the daily anxiety of aging independently.&rdquo;
            </h2>
            <p className="mt-4 text-teal-100/90 text-sm sm:text-base leading-relaxed">
              &ldquo;As an adult daughter living 20 minutes away, my biggest worry was whether mom took her blood pressure pills on time or if she felt overwhelmed. With LIFORA, Margaret has an easy-to-use tablet dashboard, and I receive immediate, quiet reassurance every single morning.&rdquo;
            </p>

            <div className="mt-6 flex items-center gap-4">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=128" 
                alt="Sarah Vance"
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
              />
              <div>
                <div className="font-bold text-base text-ivory-50">Sarah Vance</div>
                <div className="text-xs text-teal-300">Daughter of Margaret (Caregiver Admin) &bull; Portland, OR</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FINAL CALL TO ACTION                                      */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto text-center px-4 pb-8">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-teal-950">
          Ready to experience the future of coordinated care?
        </h2>
        <p className="mt-3 text-stone-600 text-base max-w-xl mx-auto">
          Try the fully functional demo right now without installing anything or entering payment information.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => loginDemo('senior')}
            className="w-full sm:w-auto px-8 py-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5 text-teal-300" />
            <span>Launch Senior View (Margaret Vance)</span>
          </button>

          <button
            onClick={() => loginDemo('caregiver')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-2xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5 text-amber-200" />
            <span>Launch Caregiver View (Sarah Vance)</span>
          </button>
        </div>

        <p className="mt-4 text-xs text-stone-400">
          Built with Next.js 15, Tailwind CSS, Prisma, Supabase PostgreSQL with RLS, and Vercel Cron.
        </p>
      </section>
    </div>
  );
}
