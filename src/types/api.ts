import { z } from 'zod';

// ====================================================================
// Standardized API Response Envelope
// ====================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function createSuccessResponse<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

// ====================================================================
// 1. Auth Schemas
// ====================================================================

export const SignupRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  preferredName: z.string().min(1, 'Preferred name is required'),
  role: z.enum(['elderly', 'family', 'caretaker']),
  phone: z.string().optional(),
  timezone: z.string().default('America/Los_Angeles'),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ====================================================================
// 2. Profile Schemas
// ====================================================================

export const UpdateProfileRequestSchema = z.object({
  fullName: z.string().min(2).optional(),
  preferredName: z.string().min(1).optional(),
  age: z.number().int().min(0).max(130).optional(),
  dob: z.string().optional(),
  bloodType: z.string().max(10).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  timezone: z.string().optional(),
  primaryConditions: z.array(z.string()).optional(),
  knownAllergies: z.array(z.string()).optional(),
  emergencyContact: z.record(z.unknown()).optional(),
  primaryPhysician: z.record(z.unknown()).optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

// ====================================================================
// 3. Medication Schemas
// ====================================================================

export const CreateMedicationSchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
  genericName: z.string().optional(),
  dosage: z.string().min(1, 'Dosage is required (e.g. 10 mg)'),
  form: z.enum(['tablet', 'capsule', 'liquid', 'inhaler', 'injection', 'drops', 'topical']),
  color: z.string().default('#2E847D'),
  purpose: z.string().min(1, 'Purpose is required (e.g. Blood Pressure)'),
  frequency: z.enum(['daily', 'twice_daily', 'three_times_daily', 'four_times_daily', 'weekly', 'as_needed']),
  scheduleTimes: z.array(z.string()).min(1, 'At least one schedule time is required'),
  withFood: z.enum(['before', 'with', 'after', 'anytime']),
  instructions: z.string().default(''),
  prescribingDoctor: z.string().default(''),
  refillCount: z.number().int().min(0).default(30),
  totalQuantity: z.number().int().min(1).default(30),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateMedicationInput = z.infer<typeof CreateMedicationSchema>;

export const UpdateMedicationSchema = CreateMedicationSchema.partial().extend({
  active: z.boolean().optional(),
});

export type UpdateMedicationInput = z.infer<typeof UpdateMedicationSchema>;

// ====================================================================
// 4. Dose Schemas
// ====================================================================

export const MarkDoseTakenSchema = z.object({
  takenAt: z.string().optional(), // ISO string or time string
  recordedBy: z.string().optional(),
  notes: z.string().optional(),
});

export type MarkDoseTakenInput = z.infer<typeof MarkDoseTakenSchema>;

export const MarkDoseMissedSchema = z.object({
  reason: z.string().min(1, 'Reason for missing dose is required'),
  recordedBy: z.string().optional(),
});

export type MarkDoseMissedInput = z.infer<typeof MarkDoseMissedSchema>;

export const SnoozeDoseSchema = z.object({
  snoozeMinutes: z.number().int().min(5).max(180).default(15),
});

export type SnoozeDoseInput = z.infer<typeof SnoozeDoseSchema>;

// ====================================================================
// 5. Care Circle Schemas
// ====================================================================

export const InviteCareCircleMemberSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  relation: z.enum(['Daughter', 'Son', 'Spouse', 'Primary Caregiver', 'Home Nurse', 'Physician', 'Neighbor']),
  role: z.enum(['family', 'caretaker']),
  phone: z.string().min(7, 'Valid telephone number is required'),
  email: z.string().email('Valid email address is required'),
  isEmergencyContact: z.boolean().default(false),
  canManageMeds: z.boolean().default(true),
  receiveInstantAlerts: z.boolean().default(true),
});

export type InviteCareCircleMemberInput = z.infer<typeof InviteCareCircleMemberSchema>;

export const UpdateCareCircleMemberSchema = InviteCareCircleMemberSchema.partial().extend({
  inviteStatus: z.enum(['invited', 'accepted', 'declined']).optional(),
});

export type UpdateCareCircleMemberInput = z.infer<typeof UpdateCareCircleMemberSchema>;

export const EmergencyBroadcastSchema = z.object({
  reason: z.string().min(1, 'Emergency reason is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type EmergencyBroadcastInput = z.infer<typeof EmergencyBroadcastSchema>;

// ====================================================================
// 6. Appointment Schemas
// ====================================================================

export const CreateAppointmentSchema = z.object({
  doctorName: z.string().min(2, 'Physician name is required'),
  specialty: z.string().min(2, 'Specialty is required'),
  facility: z.string().min(2, 'Facility / clinic is required'),
  address: z.string().default(''),
  contactNumber: z.string().default(''),
  appointmentDate: z.string().min(8, 'Appointment date is required (YYYY-MM-DD)'),
  appointmentTime: z.string().min(2, 'Appointment time is required (e.g. 10:30 AM)'),
  notes: z.string().optional(),
  requiresEscort: z.boolean().default(true),
  assignedEscort: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial().extend({
  status: z.enum(['upcoming', 'completed', 'rescheduled', 'cancelled']).optional(),
});

export type UpdateAppointmentInput = z.infer<typeof UpdateAppointmentSchema>;

// ====================================================================
