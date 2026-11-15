import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssistantService } from '@/server/services/assistant.service';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
    medication: {
      findMany: vi.fn(),
    },
    doseLog: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
  },
}));

describe('AssistantService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Clinical Medical Safeguard Filter', () => {
    it.each([
      ['Can I double up on my Lisinopril?'],
      ['Should I take two pills since I forgot?'],
      ['I want to change dose to 40mg'],
      ['Can I increase dose?'],
      ['Can you adjust dosage for me?'],
      ['Can I stop taking Metformin?'],
      ['I want to quit taking my medicine'],
      ['Can I skip dose today?'],
    ])('blocks unsafe dosage tampering query: "%s"', async (query) => {
      const response = await AssistantService.processQuery(userId, query);

      expect(response.isSafeguardTriggered).toBe(true);
      expect(response.reply).toContain('Safety Notice');
      expect(response.reply).toContain('strictly programmed to protect your health');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'call_doctor' }),
          expect.objectContaining({ action: 'call_family' }),
        ])
      );
      // Ensure database was not queried unnecessarily
      expect(prisma.profile.findUnique).not.toHaveBeenCalled();
    });

    it.each([
      ['Can you diagnose my chest pain?'],
      ['What disease causes swollen ankles?'],
      ['Do I have high blood pressure?'],
      ['Is this a heart attack?'],
      ['Is this cancer?'],
      ['What is wrong with me?'],
    ])('blocks unsafe diagnostic requests: "%s"', async (query) => {
      const response = await AssistantService.processQuery(userId, query);

      expect(response.isSafeguardTriggered).toBe(true);
      expect(response.reply).toContain('Safety Notice');
      expect(response.reply).toContain('cannot recommend altering your prescribed dosages');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'call_doctor' }),
          expect.objectContaining({ action: 'call_family' }),
        ])
      );
    });
  });

  describe('Context-Aware Medication Inquiries', () => {
    beforeEach(() => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({
        id: userId,
        preferredName: 'Margaret',
      } as any);

      vi.mocked(prisma.medication.findMany).mockResolvedValue([
        {
          name: 'Lisinopril',
          dosage: '10mg',
          withFood: 'with',
          instructions: 'Take in morning with food',
        },
      ] as any);
    });

    it('returns list of remaining doses when doses are pending', async () => {
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([
        {
          status: 'pending',
          scheduledTime: '13:00',
          medication: {
            name: 'Metformin',
            dosage: '500mg',
            instructions: 'Take with food',
          },
        },
      ] as any);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

      const response = await AssistantService.processQuery(userId, 'What pills do I have left today?');

      expect(response.isSafeguardTriggered).toBeUndefined();
      expect(response.reply).toContain('Margaret');
      expect(response.reply).toContain('1 dose remaining');
      expect(response.reply).toContain('Metformin (500mg) scheduled for 13:00');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'mark_next_dose_taken' }),
        ])
      );
    });

    it('returns celebration message when all doses for today are completed', async () => {
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([
        {
          status: 'taken',
          scheduledTime: '08:00',
          medication: { name: 'Lisinopril', dosage: '10mg' },
        },
      ] as any);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

      const response = await AssistantService.processQuery(userId, 'Do I have any more pills to take?');

      expect(response.reply).toContain('Wonderful news, Margaret!');
      expect(response.reply).toContain('completed all scheduled doses for today');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'view_meds' }),
        ])
      );
    });
  });

  describe('Context-Aware Appointment Inquiries', () => {
    it('returns formatted details of next upcoming clinical appointment', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({ preferredName: 'Margaret' } as any);
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([
        {
          doctorName: 'Dr. Robert Hayes',
          specialty: 'Cardiology',
          facility: 'Providence St. Vincent Medical Center',
          address: '9205 SW Barnes Rd, Portland, OR',
          appointmentDate: new Date('2026-11-20T10:30:00Z'),
          appointmentTime: '10:30 AM',
          assignedEscort: 'Sarah Vance (Daughter)',
          notes: 'Bring current medication list',
        },
      ] as any);

      const response = await AssistantService.processQuery(userId, 'When is my next doctor appointment?');

      expect(response.reply).toContain('Dr. Robert Hayes');
      expect(response.reply).toContain('Cardiology');
      expect(response.reply).toContain('Providence St. Vincent Medical Center');
      expect(response.reply).toContain('Sarah Vance (Daughter)');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'call_clinic' }),
        ])
      );
    });

    it('returns friendly notice when no appointments are scheduled', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({ preferredName: 'Margaret' } as any);
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

      const response = await AssistantService.processQuery(userId, 'Do I see the doctor this week?');

      expect(response.reply).toContain('no upcoming doctor appointments scheduled');
      expect(response.suggestedActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ action: 'schedule_visit' }),
        ])
      );
    });
  });

  describe('Context-Aware Food / Meal Inquiries', () => {
    it('returns meal rules for all active prescriptions', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({ preferredName: 'Margaret' } as any);
      vi.mocked(prisma.medication.findMany).mockResolvedValue([
        {
          name: 'Lisinopril',
          dosage: '10mg',
          withFood: 'with',
          instructions: 'Take in morning',
        },
        {
          name: 'Glucosamine',
          dosage: '1500mg',
          withFood: 'after',
          instructions: 'Take after food',
        },
      ] as any);
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

      const response = await AssistantService.processQuery(userId, 'Should I take my pills with food?');

      expect(response.reply).toContain('Take WITH meals');
      expect(response.reply).toContain('Take AFTER meals');
      expect(response.reply).toContain('water with your tablets');
    });
  });

  describe('Default Reassuring Overview & Offline Fallback', () => {
    it('returns personalized overview for general inquiries', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({ preferredName: 'Margaret' } as any);
      vi.mocked(prisma.medication.findMany).mockResolvedValue([]);
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([]);

      const response = await AssistantService.processQuery(userId, 'Hello Lifora!');

      expect(response.reply).toContain("Hello Margaret! I'm your Lifora Care Companion.");
      expect(response.suggestedActions?.length).toBeGreaterThan(0);
    });

    it('falls back to mock data gracefully when database queries throw', async () => {
      vi.mocked(prisma.profile.findUnique).mockRejectedValue(new Error('DB Timeout'));

      const response = await AssistantService.processQuery(userId, 'What pills are next?');

      expect(response).toBeDefined();
      expect(response.reply).toBeDefined();
      expect(response.suggestedActions).toBeDefined();
    });
  });
});
