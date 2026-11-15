'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Medication, 
  DoseScheduleItem, 
  Appointment, 
  CareCircleMember, 
  CareNotification, 
  UserRole,
  AdherenceStats,
  CareActivityItem
} from '@/types';
import { 
  mockUserProfile, 
  mockMedications, 
  mockTodaySchedule, 
  mockAppointments, 
  mockCareCircle, 
  mockNotifications,
  mockRecentActivities 
} from '@/lib/mockData';

interface CareContextType {
  profile: UserProfile;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  medications: Medication[];
  todaySchedule: DoseScheduleItem[];
  appointments: Appointment[];
  careCircle: CareCircleMember[];
  notifications: CareNotification[];
  recentActivities: CareActivityItem[];
  adherenceStats: AdherenceStats;
  markDoseAsTaken: (id: string) => void;
  markDoseAsMissed: (id: string, reason?: string) => void;
  addMedication: (medication: Omit<Medication, 'id'>) => void;
  updateMedication: (id: string, medication: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  addCareCircleMember: (member: Omit<CareCircleMember, 'id'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  triggerEmergencyAlert: (reason: string) => void;
}

const CareContext = createContext<CareContextType | undefined>(undefined);

export function CareProvider({ children }: { children: React.ReactNode }) {
  const [profile] = useState<UserProfile>(mockUserProfile);
  const [activeRole, setActiveRole] = useState<UserRole>('elderly');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const [medications, setMedications] = useState<Medication[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_medications');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockMedications;
  });

  const [todaySchedule, setTodaySchedule] = useState<DoseScheduleItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_schedule');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockTodaySchedule;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_appointments');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockAppointments;
  });

  const [careCircle, setCareCircle] = useState<CareCircleMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_care_circle');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockCareCircle;
  });

  const [notifications, setNotifications] = useState<CareNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_notifications');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockNotifications;
  });

  const [recentActivities, setRecentActivities] = useState<CareActivityItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lifora_recent_activities');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
    }
    return mockRecentActivities;
  });

  // Save changes to localStorage for local testing
  useEffect(() => {
    localStorage.setItem('lifora_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('lifora_schedule', JSON.stringify(todaySchedule));
  }, [todaySchedule]);

  useEffect(() => {
    localStorage.setItem('lifora_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('lifora_care_circle', JSON.stringify(careCircle));
  }, [careCircle]);

  useEffect(() => {
    localStorage.setItem('lifora_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('lifora_recent_activities', JSON.stringify(recentActivities));
  }, [recentActivities]);

  // Calculate adherence
  const totalScheduledToday = todaySchedule.length;
  const totalTakenToday = todaySchedule.filter((d) => d.status === 'taken').length;
  const todayPercentage = totalScheduledToday > 0 ? Math.round((totalTakenToday / totalScheduledToday) * 100) : 100;

  const adherenceStats: AdherenceStats = {
    todayPercentage,
    weeklyPercentage: 92,
    monthlyPercentage: 88,
    consecutiveStreakDays: 5,
    totalTakenToday,
    totalScheduledToday,
  };

  const markDoseAsTaken = (id: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actorLabel = activeRole === 'elderly' ? `${profile.preferredName} (Self)` : 'Sarah Vance (Daughter)';

    const updated = todaySchedule.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'taken' as const,
          takenAt: timeNow,
          recordedBy: actorLabel,
          updatedAt: timeNow,
        };
      }
      return item;
    });

    setTodaySchedule(updated);

    // Check if all doses for today are now taken
    const allTakenNow = updated.every((item) => item.status === 'taken');
    if (allTakenNow) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2E847D', '#69957F', '#F59E0B', '#3B82F6'],
        });
      } catch (err) {
        console.warn('Confetti animation:', err);
      }
    }

    // Add positive notification & activity record
    const dose = todaySchedule.find((d) => d.id === id);
    if (dose) {
      const newNotif: CareNotification = {
        id: `notif-${Date.now()}`,
        type: 'medication_reminder',
        severity: 'success',
        title: 'Medication Confirmed',
        message: `${dose.medicationName} (${dose.dosage}) recorded as taken by ${actorLabel}. Great job!`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      const newActivity: CareActivityItem = {
        id: `act-${Date.now()}`,
        timestamp: `${timeNow} Today`,
        actorName: activeRole === 'elderly' ? profile.name : 'Sarah Vance',
        actorRole: activeRole === 'elderly' ? 'elderly' : 'family',
        action: 'dose_taken',
        title: `${dose.medicationName} Confirmed Taken`,
        description: `${dose.dosage} marked as taken at ${timeNow} by ${actorLabel}.`,
        badge: 'On Time',
      };
      setRecentActivities((prev) => [newActivity, ...prev]);
    }
  };

  const markDoseAsMissed = (id: string, reason?: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const actorLabel = activeRole === 'elderly' ? `${profile.preferredName} (Self)` : 'Sarah Vance (Daughter)';

    setTodaySchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: 'missed' as const,
            missedReason: reason || 'Not taken at scheduled time',
            recordedBy: actorLabel,
            updatedAt: timeNow,
          };
        }
        return item;
      })
    );

    const dose = todaySchedule.find((d) => d.id === id);
    if (dose) {
      const newNotif: CareNotification = {
        id: `notif-${Date.now()}`,
        type: 'medication_missed',
        severity: 'warning',
        title: 'Dose Marked as Missed',
        message: `${dose.medicationName} (${dose.dosage}) was not taken. Family and caretakers will be notified.`,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      const newActivity: CareActivityItem = {
        id: `act-${Date.now()}`,
        timestamp: `${timeNow} Today`,
        actorName: activeRole === 'elderly' ? profile.name : 'Sarah Vance',
        actorRole: activeRole === 'elderly' ? 'elderly' : 'family',
        action: 'dose_missed',
        title: `${dose.medicationName} Marked Missed`,
        description: `Dose missed: ${reason || 'Scheduled time passed'}. Logged by ${actorLabel}.`,
        badge: 'Missed',
      };
      setRecentActivities((prev) => [newActivity, ...prev]);
    }
  };

  const addMedication = (newMed: Omit<Medication, 'id'>) => {
    const medId = `med-${Date.now()}`;
    const fullMed: Medication = { ...newMed, id: medId };
    setMedications((prev) => [...prev, fullMed]);

    const newActivity: CareActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actorName: activeRole === 'elderly' ? profile.name : 'Sarah Vance',
      actorRole: activeRole === 'elderly' ? 'elderly' : 'family',
      action: 'medication_added',
      title: 'New Prescription Added',
      description: `${fullMed.name} (${fullMed.dosage}) added to active regimen.`,
      badge: 'New Regimen',
    };
    setRecentActivities((prev) => [newActivity, ...prev]);

    // Automatically generate today's doses for this medication if active
    if (fullMed.active && fullMed.scheduleTimes.length > 0) {
      const newDoses: DoseScheduleItem[] = fullMed.scheduleTimes.map((time, idx) => ({
        id: `dose-${medId}-${idx}`,
        medicationId: medId,
        medicationName: fullMed.name,
        genericName: fullMed.genericName,
        dosage: fullMed.dosage,
        form: fullMed.form,
        color: fullMed.color || '#3B82F6',
        scheduledTime: time,
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        withFood: fullMed.withFood,
        instructions: fullMed.instructions,
        purpose: fullMed.purpose,
      }));
      setTodaySchedule((prev) => [...prev, ...newDoses]);
    }
  };

  const updateMedication = (id: string, updatedFields: Partial<Medication>) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, ...updatedFields } : med))
    );
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
    setTodaySchedule((prev) => prev.filter((dose) => dose.medicationId !== id));
  };

  const addAppointment = (newApt: Omit<Appointment, 'id'>) => {
    const fullApt: Appointment = { ...newApt, id: `apt-${Date.now()}` };
    setAppointments((prev) => [...prev, fullApt]);

    const newActivity: CareActivityItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actorName: activeRole === 'elderly' ? profile.name : 'Sarah Vance',
      actorRole: activeRole === 'elderly' ? 'elderly' : 'family',
      action: 'appointment_scheduled',
      title: 'Appointment Scheduled',
      description: `Visit with ${fullApt.doctorName} (${fullApt.specialty}) scheduled for ${fullApt.date}.`,
      badge: 'Clinic',
    };
    setRecentActivities((prev) => [newActivity, ...prev]);
  };

  const addCareCircleMember = (newMember: Omit<CareCircleMember, 'id'>) => {
    const fullMember: CareCircleMember = {
      ...newMember,
      id: `member-${Date.now()}`,
      lastActive: 'Just invited',
    };
    setCareCircle((prev) => [...prev, fullMember]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const triggerEmergencyAlert = (reason: string) => {
    const alertNotif: CareNotification = {
      id: `urgent-${Date.now()}`,
      type: 'system',
      severity: 'urgent',
      title: 'Emergency Contact Alert Sent',
      message: `Emergency alert broadcast to ${careCircle.map((c) => c.name).join(', ')}. Reason: ${reason}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [alertNotif, ...prev]);
  };

  return (
    <CareContext.Provider
      value={{
        profile,
        activeRole,
        setActiveRole,
        fontSize,
        setFontSize,
        medications,
        todaySchedule,
        appointments,
        careCircle,
        notifications,
        recentActivities,
        adherenceStats,
        markDoseAsTaken,
        markDoseAsMissed,
        addMedication,
        updateMedication,
        deleteMedication,
        addAppointment,
        addCareCircleMember,
        markNotificationAsRead,
        clearAllNotifications,
        triggerEmergencyAlert,
      }}
    >
      {children}
    </CareContext.Provider>
  );
}

export function useCare() {
  const context = useContext(CareContext);
  if (!context) {
    throw new Error('useCare must be used within a CareProvider');
  }
  return context;
}
