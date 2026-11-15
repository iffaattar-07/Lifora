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
