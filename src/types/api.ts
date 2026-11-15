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
