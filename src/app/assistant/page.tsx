'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Volume2, 
  ShieldAlert, 
  User, 
  Bot, 
  Clock, 
  Calendar, 
  Pill, 
  PhoneCall, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useCare } from '@/context/CareContext';
import { ChatMessage } from '@/types';

export default function AssistantPage() {
  const { profile, todaySchedule, medications, appointments, careCircle, markDoseAsTaken } = useCare();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: `Hello ${profile.preferredName}! I am your Lifora Care Assistant. I'm connected directly to your medication plan, doctor appointments, and care circle.\n\nHow can I help you today? You can ask about your next dose, doctor visits, or instructions for taking your pills.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'What pills do I take next?', action: 'query_next_pill' },
        { label: 'When is my next appointment?', action: 'query_next_apt' },
        { label: 'Do I take my pills with food?', action: 'query_food_rules' },
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          context: {
            profile,
            todaySchedule,
            medications,
            appointments,
            careCircle,
          },
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: data.suggestedActions,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: "I'm having a brief connection delay, but I'm right here. Margaret, your next scheduled medication is Glucosamine Sulfate at 1:00 PM.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const quickPrompts = [
    'What pills are left for today?',
    'When is my next doctor visit?',
    'Can I take medications with food?',
    'Call my emergency contact',
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-sage-200/80 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-800 to-teal-950 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-stone-900 font-serif">Intelligent Care Assistant</h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                Context-Aware
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
              Trained on Margaret Vance&apos;s active prescriptions, doctor schedules, and care guidelines.
            </p>
          </div>
        </div>

        {/* Safeguard badge */}
        <div className="bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 max-w-sm">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <p className="text-[11px] text-amber-900 leading-tight">
            Lifora provides schedule and care assistance. It does not alter physician orders or make clinical diagnoses.
          </p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat Window */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-sage-200/80 shadow-soft-card flex flex-col h-[650px] overflow-hidden">
          {/* Chat Messages Log */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-900 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-800 text-white rounded-tr-none'
                        : 'bg-white border border-stone-200 text-stone-900 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    <div
                      className={`flex items-center justify-between mt-2 pt-1 border-t text-[10px] ${
                        msg.sender === 'user'
                          ? 'border-teal-700/50 text-teal-200'
                          : 'border-stone-100 text-stone-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'assistant' && (
                        <button
                          onClick={() => handleSpeak(msg.content)}
                          className="hover:text-teal-800 flex items-center gap-1 transition"
                          title="Listen aloud"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contextual Action Chips */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {msg.suggestedActions.map((act) => (
                        <button
                          key={act.label}
                          onClick={() => handleSend(act.label)}
                          className="text-xs bg-white hover:bg-teal-50 hover:text-teal-900 font-semibold text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-teal-300 transition shadow-xs flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 max-w-md">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white border border-stone-200 p-4 rounded-2xl text-xs text-stone-500 rounded-tl-none shadow-xs flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                  <span>Lifora Assistant is analyzing Margaret&apos;s care plan...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt suggestions */}
          <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200/80 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0">
              Quick Ask:
            </span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="text-xs bg-white hover:bg-teal-50 hover:text-teal-900 text-stone-700 px-3 py-1 rounded-lg border border-stone-200 whitespace-nowrap transition font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
            <input
              type="text"
              placeholder="Ask anything about Margaret's care, medications or visits..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:border-teal-700 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-3.5 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white rounded-2xl transition shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Real-time Care Snapshot Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-sage-200/80 shadow-soft-card space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-serif border-b border-stone-100 pb-2">
              Live Care Context
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-700" />
                  Active Prescriptions
                </span>
                <span className="font-bold text-stone-900">{medications.length} Medications</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Doses Today
                </span>
                <span className="font-bold text-amber-800">
                  {todaySchedule.filter((d) => d.status === 'pending').length} Remaining
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  Upcoming Doctor Visit
                </span>
                <span className="font-bold text-stone-900">
                  {appointments[0] ? new Date(appointments[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'None'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-stone-600 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                  Primary Emergency Contact
                </span>
                <span className="font-bold text-stone-900">{profile.emergencyContact.name}</span>
              </div>
            </div>

            <div className="p-3 bg-sage-50 rounded-2xl border border-sage-200 text-xs text-stone-600 leading-relaxed">
              <strong>Context Engine:</strong> Any question you ask is resolved against Margaret&apos;s real-time schedule, doctor instructions, and care circle state.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
