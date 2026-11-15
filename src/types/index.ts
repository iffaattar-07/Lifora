export type UserRole = 'elderly' | 'family' | 'caretaker';

export interface UserProfile {
  id: string;
  name: string;
  preferredName: string;
  age: number;
  dob: string;
  bloodType: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  primaryCondition: string[];
  allergies: string[];
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  primaryDoctor: {
    name: string;
    clinic: string;
    phone: string;
  };
}

export type MedicationForm = 
  | 'tablet' 
  | 'capsule' 
  | 'liquid' 
  | 'inhaler' 
  | 'injection' 
  | 'drops' 
  | 'topical';

export type FoodRequirement = 'before' | 'with' | 'after' | 'anytime';

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  form: MedicationForm;
  color?: string;
  purpose: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'four_times_daily' | 'weekly' | 'as_needed';
  scheduleTimes: string[]; // e.g. ["08:00", "20:00"]
  withFood: FoodRequirement;
  instructions: string;
  prescribingDoctor: string;
  refillCount: number;
  totalQuantity: number;
  active: boolean;
  startDate: string;
  endDate?: string;
}

export type DoseStatus = 'pending' | 'taken' | 'missed' | 'snoozed';

export interface DoseScheduleItem {
  id: string;
  medicationId: string;
  medicationName: string;
  genericName?: string;
  dosage: string;
  form: MedicationForm;
  color?: string;
  scheduledTime: string; // "08:00 AM"
  scheduledDate: string; // "YYYY-MM-DD"
  status: DoseStatus;
  takenAt?: string;
  missedReason?: string;
  recordedBy?: string; // e.g. "Margaret Vance (Self)", "Sarah Vance (Daughter)"
  updatedAt?: string;  // e.g. "08:15 AM"
  withFood: FoodRequirement;
  instructions?: string;
  purpose?: string;
}

export interface AdherenceStats {
  todayPercentage: number;
  weeklyPercentage: number;
  monthlyPercentage: number;
  consecutiveStreakDays: number;
  totalTakenToday: number;
  totalScheduledToday: number;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  facility: string;
  address: string;
  date: string; // "2026-11-18"
  time: string; // "10:30 AM"
  notes?: string;
  contactNumber: string;
  requiresEscort: boolean;
  assignedEscort?: string;
  status: 'upcoming' | 'completed' | 'rescheduled' | 'cancelled';
}

export type CaregiverRelation = 
  | 'Daughter' 
  | 'Son' 
  | 'Spouse' 
  | 'Primary Caregiver' 
  | 'Home Nurse' 
  | 'Physician' 
  | 'Neighbor';

export interface CareCircleMember {
  id: string;
  name: string;
  relation: CaregiverRelation;
  role: 'family' | 'caretaker';
  phone: string;
  email: string;
  isEmergencyContact: boolean;
  canManageMeds: boolean;
  receiveInstantAlerts: boolean;
  avatarUrl?: string;
  lastActive: string;
}

export interface CareNotification {
  id: string;
  type: 'medication_reminder' | 'medication_missed' | 'appointment' | 'circle_update' | 'system';
  severity: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    action: string;
    payload?: Record<string, unknown>;
  }[];
}

export type CareActivityAction = 
  | 'dose_taken' 
  | 'dose_missed' 
  | 'appointment_scheduled' 
  | 'appointment_escort' 
  | 'medication_added' 
  | 'refill_requested' 
  | 'vitals_logged'
  | 'alert_acknowledged';

export interface CareActivityItem {
  id: string;
  timestamp: string; // ISO string or human string
  actorName: string;
  actorRole: 'elderly' | 'family' | 'caretaker' | 'system';
  action: CareActivityAction;
  title: string;
  description: string;
  badge?: string;
}

