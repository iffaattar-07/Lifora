import type { Metadata } from 'next';
import './globals.css';
import { CareProvider } from '@/context/CareContext';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'LIFORA | Intelligent Elderly Care & Wellness Platform',
  description:
    'Making every day healthier, together. LIFORA connects elderly individuals, their families, and caretakers with medication tracking, coordinated care, and intelligent context-aware assistance.',
  keywords: ['elderly care', 'medication management', 'family caregiver', 'health platform', 'adherence tracking'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ivory-50 text-stone-900 font-sans flex flex-col selection:bg-teal-200 selection:text-teal-950">
        <CareProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="bg-white border-t border-sage-200/80 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-stone-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-teal-950 text-sm">LIFORA</span>
                <span>&bull; Intelligent Elderly Care &amp; Wellness Platform</span>
              </div>
              <div className="flex items-center gap-4 text-stone-600">
                <a href="/medications" className="hover:text-teal-900">Medications</a>
                <a href="/appointments" className="hover:text-teal-900">Appointments</a>
                <a href="/care-circle" className="hover:text-teal-900">Care Circle</a>
                <a href="/assistant" className="hover:text-teal-900">AI Assistant</a>
              </div>
              <p className="text-stone-400">
                LIFORA is a care coordination platform. Never alter prescription regimens without direct physician consultation.
              </p>
            </div>
          </footer>
        </CareProvider>
      </body>
    </html>
  );
}
