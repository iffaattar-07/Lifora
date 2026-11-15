import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DoseService } from '@/server/services/dose.service';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/server/services/notification.service';

vi.mock('@/lib/db', () => ({
  prisma: {
    doseLog: {
      findMany: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    medication: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/server/services/notification.service', () => ({
  NotificationService: {
    createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
  },
}));

describe('DoseService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTodaySchedule', () => {
    it('calculates adherence stats accurately when doses exist', async () => {
      const mockDoses = [
        {
          id: 'dose-1',
          medicationId: 'med-1',
          userId,
          scheduledTime: '08:00',
          scheduledDate: new Date('2026-11-15T00:00:00.000Z'),
          status: 'taken',
          takenAt: new Date('2026-11-15T08:05:00.000Z'),
          recordedBy: 'Margaret Vance (Self)',
          medication: {
            name: 'Lisinopril',
            dosage: '10mg',
            form: 'tablet',
            color: '#2E847D',
            withFood: true,
            instructions: 'Take with breakfast',
            purpose: 'Blood Pressure',
          },
        },
        {
          id: 'dose-2',
          medicationId: 'med-2',
          userId,
          scheduledTime: '13:00',
          scheduledDate: new Date('2026-11-15T00:00:00.000Z'),
          status: 'pending',
          takenAt: null,
          recordedBy: null,
          medication: {
            name: 'Metformin',
            dosage: '500mg',
            form: 'capsule',
            color: '#4A9B8E',
            withFood: true,
            instructions: 'Take with lunch',
            purpose: 'Blood Sugar',
          },
        },
      ];

      vi.mocked(prisma.doseLog.findMany).mockResolvedValue(mockDoses as any);

      const result = await DoseService.getTodaySchedule(userId);

      expect(result.schedule).toHaveLength(2);
      expect(result.schedule[0].status).toBe('taken');
      expect(result.schedule[1].status).toBe('pending');
      expect(result.adherenceStats.totalScheduledToday).toBe(2);
      expect(result.adherenceStats.totalTakenToday).toBe(1);
      expect(result.adherenceStats.todayPercentage).toBe(50);
    });

    it('returns 100% adherence if totalScheduledToday is 0', async () => {
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([]);

      const result = await DoseService.getTodaySchedule(userId);
      expect(result.schedule).toHaveLength(0);
      expect(result.adherenceStats.todayPercentage).toBe(100);
      expect(result.adherenceStats.totalScheduledToday).toBe(0);
    });

    it('falls back to mock data if database read fails', async () => {
      vi.mocked(prisma.doseLog.findMany).mockRejectedValue(new Error('Connection failed'));

      const result = await DoseService.getTodaySchedule(userId);
      expect(result.schedule.length).toBeGreaterThan(0);
      expect(result.adherenceStats).toBeDefined();
    });
  });

  describe('markDoseTaken', () => {
    const mockDose = {
      id: 'dose-1',
      userId,
      medicationId: 'med-1',
      status: 'taken',
      medication: {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        refillCount: 15,
      },
    };

    it('updates dose status, decrements medication inventory, notifies, and logs audit', async () => {
      vi.mocked(prisma.doseLog.update).mockResolvedValue(mockDose as any);
      vi.mocked(prisma.medication.update).mockResolvedValue({
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        refillCount: 14,
      } as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await DoseService.markDoseTaken('dose-1', 'Margaret Vance', 'elderly');

      expect(result).toEqual(mockDose);
      expect(prisma.doseLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dose-1' },
          data: expect.objectContaining({
            status: 'taken',
            recordedBy: 'Margaret Vance (Self)',
          }),
        })
      );
      expect(prisma.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: { refillCount: { decrement: 1 } },
      });
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'medication_reminder',
          severity: 'success',
          title: 'Medication Confirmed',
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'dose_taken',
            entityId: 'dose-1',
          }),
        })
      );
    });

    it('triggers a pharmacy refill alert when remaining refillCount is <= 7', async () => {
      vi.mocked(prisma.doseLog.update).mockResolvedValue(mockDose as any);
      vi.mocked(prisma.medication.update).mockResolvedValue({
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        refillCount: 5, // <= 7
      } as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      await DoseService.markDoseTaken('dose-1', 'Sarah Vance', 'family');

      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'warning',
          title: 'Lisinopril Refill Alert',
          actionLabel: 'Order Refill',
        })
      );
    });

    it('handles fallback gracefully when database throws', async () => {
      vi.mocked(prisma.doseLog.update).mockRejectedValue(new Error('DB failure'));

      const fallbackResult = await DoseService.markDoseTaken('dose-1', 'Margaret Vance');
      expect(fallbackResult).toEqual(
        expect.objectContaining({
          id: 'dose-1',
          status: 'taken',
        })
      );
    });
  });

  describe('markDoseMissed', () => {
    const mockDose = {
      id: 'dose-2',
      userId,
      scheduledTime: '13:00',
      status: 'missed',
      medication: {
        name: 'Metformin',
        dosage: '500mg',
      },
    };

    it('records dose as missed with reason, alerts family, and creates audit event', async () => {
      vi.mocked(prisma.doseLog.update).mockResolvedValue(mockDose as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await DoseService.markDoseMissed(
        'dose-2',
        'Sarah Vance',
        'family',
        'Felt dizzy after lunch'
      );

      expect(result).toEqual(mockDose);
      expect(prisma.doseLog.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'dose-2' },
          data: expect.objectContaining({
            status: 'missed',
            missedReason: 'Felt dizzy after lunch',
            recordedBy: 'Sarah Vance (Caregiver)',
          }),
        })
      );
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'medication_missed',
          severity: 'warning',
          title: 'Missed Medication Alert',
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'dose_missed',
            entityId: 'dose-2',
          }),
        })
      );
    });

    it('falls back gracefully on DB error', async () => {
      vi.mocked(prisma.doseLog.update).mockRejectedValue(new Error('Update failed'));

      const result = await DoseService.markDoseMissed('dose-2', 'Margaret Vance');
      expect(result).toEqual(
        expect.objectContaining({
          id: 'dose-2',
          status: 'missed',
        })
      );
    });
  });

  describe('generateDailyDosesForDate (Cron)', () => {
    it('queries active medications and creates dose slots for all scheduled times', async () => {
      const activeMeds = [
        {
          id: 'med-1',
          userId: 'user-1',
          scheduleTimes: ['08:00', '20:00'],
        },
        {
          id: 'med-2',
          userId: 'user-1',
          scheduleTimes: ['13:00'],
        },
      ];
      vi.mocked(prisma.medication.findMany).mockResolvedValue(activeMeds as any);
      vi.mocked(prisma.doseLog.upsert).mockResolvedValue({ id: 'dose-new' } as any);

      const result = await DoseService.generateDailyDosesForDate(new Date('2026-11-16'));

      expect(result.activeMedicationCount).toBe(2);
      expect(result.generatedCount).toBe(3); // 2 + 1
      expect(prisma.doseLog.upsert).toHaveBeenCalledTimes(3);
    });

    it('falls back to demo mode on cron database failure', async () => {
      vi.mocked(prisma.medication.findMany).mockRejectedValue(new Error('Cron DB down'));

      const result = await DoseService.generateDailyDosesForDate();
      expect(result.isDemoFallback).toBe(true);
      expect(result.generatedCount).toBeGreaterThan(0);
    });
  });

  describe('evaluateOverdueMissedDoses (Cron)', () => {
    it('evaluates pending doses and returns metrics', async () => {
      vi.mocked(prisma.doseLog.findMany).mockResolvedValue([
        { id: 'dose-1', status: 'pending', scheduledTime: '08:00' },
      ] as any);

      const result = await DoseService.evaluateOverdueMissedDoses();
      expect(result.evaluatedCount).toBe(1);
    });

    it('falls back to demo response on failure', async () => {
      vi.mocked(prisma.doseLog.findMany).mockRejectedValue(new Error('Evaluation failed'));

      const result = await DoseService.evaluateOverdueMissedDoses();
      expect(result.isDemoFallback).toBe(true);
    });
  });
});
