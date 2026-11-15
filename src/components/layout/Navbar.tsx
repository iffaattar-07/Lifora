'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { 
  Heart, 
  Bell, 
  PhoneCall, 
  User, 
  Users, 
  Sparkles, 
  Calendar, 
  Pill, 
  CheckCircle, 
  AlertTriangle,
  Menu,
  X,
  Type
} from 'lucide-react';
import { useCare } from '@/context/CareContext';

export function Navbar() {
  const pathname = usePathname();
  const { 
    profile, 
    activeRole, 
    setActiveRole, 
    fontSize, 
    setFontSize, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications,
    triggerEmergencyAlert 
  } = useCare();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Heart },
    { href: '/medications', label: 'Medications', icon: Pill },
    { href: '/appointments', label: 'Appointments', icon: Calendar },
    { href: '/care-circle', label: 'Care Circle', icon: Users },
    { href: '/assistant', label: 'Care Assistant', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sage-200/80 shadow-sm transition-all">
        {/* Top Emergency & Access Ribbon for elderly safety */}
        <div className="bg-teal-900 text-teal-50 px-4 py-1.5 text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Care Circle Active &bull; Monitored by {profile.emergencyContact.name} ({profile.emergencyContact.relationship})</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Accessibility Font Resizer */}
            <div className="flex items-center gap-1.5 bg-teal-950/60 px-2 py-0.5 rounded-md border border-teal-700/50">
              <Type className="w-3.5 h-3.5 text-teal-300" />
              <span className="text-[11px] text-teal-300 hidden md:inline">Text Size:</span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 rounded text-xs transition ${fontSize === 'normal' ? 'bg-teal-700 text-white font-bold' : 'text-teal-300 hover:text-white'}`}
                title="Standard Text"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded text-xs transition ${fontSize === 'large' ? 'bg-teal-700 text-white font-bold' : 'text-teal-300 hover:text-white'}`}
                title="Large Text (Senior Friendly)"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-1.5 py-0.5 rounded text-xs transition ${fontSize === 'xlarge' ? 'bg-teal-700 text-white font-bold' : 'text-teal-300 hover:text-white'}`}
                title="Extra Large Text"
              >
                A++
              </button>
            </div>

            {/* Quick Emergency Button */}
            <button
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs px-2.5 py-0.5 rounded-full font-bold transition shadow-sm"
            >
              <PhoneCall className="w-3 h-3" />
              <span>SOS Call</span>
            </button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo & Tagline */}
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-teal-900/10 group-hover:scale-105 transition-transform">
                  <Heart className="w-6 h-6 text-emerald-300 fill-emerald-300/20" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold tracking-tight text-teal-950 font-serif">LIFORA</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sage-100 text-sage-800 px-2 py-0.5 rounded-full border border-sage-300">
                      Care
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">Making every day healthier, together</p>
                </div>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-sage-50/80 p-1.5 rounded-2xl border border-sage-200">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-teal-800 text-white shadow-sm'
                        : 'text-stone-700 hover:text-teal-900 hover:bg-white/80'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-stone-500'}`} />
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500 text-white">
                        {link.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>

            {/* Right Controls: Role Selector, Notifications & Profile */}
            <div className="flex items-center gap-3">
              {/* Role Toggle Pill (Perspective Switcher) */}
              <div 
                className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs shadow-inner"
                title="Perspective Switcher (Demo View Mode - switches dashboard interface)"
              >
                <button
                  onClick={() => setActiveRole('elderly')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                    activeRole === 'elderly'
                      ? 'bg-white text-teal-950 shadow-sm border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Senior (Margaret)</span>
                </button>
                <button
                  onClick={() => setActiveRole('family')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                    activeRole === 'family' || activeRole === 'caretaker'
                      ? 'bg-teal-800 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-teal-200" />
                  <span>Caregiver (Sarah)</span>
                </button>
              </div>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 rounded-xl text-stone-700 hover:bg-sage-100 transition border border-transparent hover:border-sage-200"
                  aria-label="Care notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 z-50">
                    <div className="px-4 pb-2 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-stone-900 text-sm">Care Updates</h4>
                        <p className="text-xs text-stone-500">{unreadCount} unread notices</p>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-teal-700 hover:text-teal-900 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-stone-500">
                          No recent notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => markNotificationAsRead(notif.id)}
                            className={`p-3.5 hover:bg-sage-50/50 transition cursor-pointer flex gap-3 ${
                              !notif.isRead ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="mt-0.5">
                              {notif.severity === 'urgent' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                              {notif.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {notif.severity === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                              {notif.severity === 'info' && <Bell className="w-4 h-4 text-teal-600" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-stone-900">{notif.title}</p>
                              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{notif.message}</p>
                              <span className="text-[10px] text-stone-400 mt-1 block">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-stone-700 hover:bg-stone-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-sage-200 bg-white px-4 py-4 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="text-xs font-semibold text-stone-600 uppercase">View Mode</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveRole('elderly')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${activeRole === 'elderly' ? 'bg-teal-900 text-white' : 'bg-stone-100 text-stone-700'}`}
                >
                  Senior (Margaret)
                </button>
                <button
                  onClick={() => setActiveRole('family')}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${activeRole !== 'elderly' ? 'bg-teal-800 text-white' : 'bg-stone-100 text-stone-700'}`}
                >
                  Caregiver (Sarah)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-800 hover:bg-sage-50 font-medium text-sm"
                  >
                    <Icon className="w-5 h-5 text-teal-700" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Emergency Call Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-center text-stone-900 font-serif">
              Emergency Care Assistance
            </h3>
            <p className="text-sm text-stone-600 text-center mt-2 leading-relaxed">
              Would you like to instantly connect with Margaret&apos;s primary family contact?
            </p>

            <div className="mt-6 bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{profile.emergencyContact.name}</h4>
                  <p className="text-xs text-stone-600">{profile.emergencyContact.relationship} &bull; Primary Escort</p>
                </div>
                <a
                  href={`tel:${profile.emergencyContact.phone}`}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call {profile.emergencyContact.phone}</span>
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  triggerEmergencyAlert('Direct SOS triggered from application top banner');
                  setShowEmergencyModal(false);
                }}
                className="w-full py-3 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition"
              >
                Send Urgent SMS & Notification to Care Circle
              </button>

              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full py-2.5 text-stone-500 hover:text-stone-800 text-sm font-medium transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
