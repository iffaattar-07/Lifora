import { describe, it, expect } from 'vitest';
import {
  createSuccessResponse,
  createErrorResponse,
  SignupRequestSchema,
  LoginRequestSchema,
  UpdateProfileRequestSchema,
  CreateMedicationSchema,
  UpdateMedicationSchema,
  MarkDoseTakenSchema,
  MarkDoseMissedSchema,
  SnoozeDoseSchema,
  InviteCareCircleMemberSchema,
  EmergencyBroadcastSchema,
  CreateAppointmentSchema,
  AssistantChatSchema,
} from '@/types/api';

describe('API Contracts & Zod Validation Layer (api.ts)', () => {
  describe('Standardized API Response Envelopes', () => {
    it('creates standard success response with meta timestamp and optional requestId', () => {
      const payload = { id: 'item-1', name: 'Test' };
      const res = createSuccessResponse(payload, 'req-abc-123');

      expect(res.success).toBe(true);
      expect(res.data).toEqual(payload);
      expect(res.meta?.requestId).toBe('req-abc-123');
      expect(typeof res.meta?.timestamp).toBe('string');
      expect(res.error).toBeUndefined();
    });

    it('creates standard error response with structured error code and details', () => {
      const errDetails = { field: 'dosage', reason: 'Missing unit' };
      const res = createErrorResponse('INVALID_PAYLOAD', 'Dosage is invalid', errDetails, 'req-err-456');

      expect(res.success).toBe(false);
      expect(res.data).toBeUndefined();
      expect(res.error?.code).toBe('INVALID_PAYLOAD');
      expect(res.error?.message).toBe('Dosage is invalid');
      expect(res.error?.details).toEqual(errDetails);
      expect(res.meta?.requestId).toBe('req-err-456');
    });
  });

  describe('Auth Request Schemas', () => {
    it('validates a complete signup request', () => {
      const valid = {
        email: 'margaret@lifora.demo',
        password: 'ValidPassword123',
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        role: 'elderly',
      };
      const parsed = SignupRequestSchema.safeParse(valid);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.timezone).toBe('America/Los_Angeles');
      }
    });

    it('rejects short passwords and invalid emails', () => {
      const invalid = {
        email: 'not-an-email',
        password: 'short',
        fullName: 'M',
        preferredName: '',
        role: 'invalid-role',
      };
      const parsed = SignupRequestSchema.safeParse(invalid);
      expect(parsed.success).toBe(false);
    });

    it('validates a login request', () => {
      const valid = { email: 'sarah@lifora.demo', password: 'Sarah@123' };
      expect(LoginRequestSchema.safeParse(valid).success).toBe(true);
    });
  });

  describe('Medication Schemas', () => {
    it('validates and applies defaults for new medication prescriptions', () => {
      const input = {
        name: 'Lisinopril',
        dosage: '10mg',
        form: 'tablet',
        purpose: 'Blood Pressure',
        frequency: 'daily',
        scheduleTimes: ['08:00 AM'],
        withFood: 'with',
      };
      const parsed = CreateMedicationSchema.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.refillCount).toBe(30);
        expect(parsed.data.totalQuantity).toBe(30);
        expect(parsed.data.color).toBe('#2E847D');
      }
    });

    it('rejects empty medication name or scheduleTimes', () => {
      const invalid = {
        name: '',
        dosage: '10mg',
        form: 'tablet',
        purpose: 'Blood Pressure',
        frequency: 'daily',
        scheduleTimes: [],
        withFood: 'with',
      };
      expect(CreateMedicationSchema.safeParse(invalid).success).toBe(false);
    });

    it('allows partial updates through UpdateMedicationSchema', () => {
      const partialUpdate = { refillCount: 45, active: false };
      expect(UpdateMedicationSchema.safeParse(partialUpdate).success).toBe(true);
    });
  });

  describe('Dose Transition Schemas', () => {
    it('validates markDoseTaken with optional takenAt', () => {
      expect(MarkDoseTakenSchema.safeParse({}).success).toBe(true);
      expect(MarkDoseTakenSchema.safeParse({ takenAt: '2026-11-15T08:05:00Z', notes: 'Took with milk' }).success).toBe(true);
    });

    it('requires a reason when recording a missed dose', () => {
      expect(MarkDoseMissedSchema.safeParse({}).success).toBe(false);
      expect(MarkDoseMissedSchema.safeParse({ reason: 'Patient was sleeping' }).success).toBe(true);
    });

    it('enforces bounds on snooze minutes (5 to 180 min)', () => {
      expect(SnoozeDoseSchema.safeParse({ snoozeMinutes: 15 }).success).toBe(true);
      expect(SnoozeDoseSchema.safeParse({ snoozeMinutes: 2 }).success).toBe(false);
      expect(SnoozeDoseSchema.safeParse({ snoozeMinutes: 240 }).success).toBe(false);
    });
  });

  describe('Care Circle & Emergency Schemas', () => {
    it('validates care circle member invitation with defaults', () => {
      const input = {
        name: 'Sarah Vance',
        relation: 'Daughter',
        role: 'family',
        phone: '(503) 555-0192',
        email: 'sarah@lifora.demo',
      };
      const parsed = InviteCareCircleMemberSchema.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.canManageMeds).toBe(true);
        expect(parsed.data.receiveInstantAlerts).toBe(true);
        expect(parsed.data.isEmergencyContact).toBe(false);
      }
    });

    it('validates emergency broadcast distress payload', () => {
      expect(EmergencyBroadcastSchema.safeParse({ reason: 'Fell in hallway', latitude: 45.5152, longitude: -122.6784 }).success).toBe(true);
      expect(EmergencyBroadcastSchema.safeParse({ reason: '' }).success).toBe(false);
    });
  });

  describe('Appointment & Assistant Schemas', () => {
    it('validates appointment creation', () => {
      const input = {
        doctorName: 'Dr. Robert Hayes',
        specialty: 'Cardiology',
        facility: 'Providence Heart Clinic',
        appointmentDate: '2026-11-20',
        appointmentTime: '10:30 AM',
      };
      const parsed = CreateAppointmentSchema.safeParse(input);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.requiresEscort).toBe(true);
      }
    });

    it('validates AI Assistant query input', () => {
      expect(AssistantChatSchema.safeParse({ message: 'What pills do I take next?' }).success).toBe(true);
      expect(AssistantChatSchema.safeParse({ message: '' }).success).toBe(false);
    });
  });
});
