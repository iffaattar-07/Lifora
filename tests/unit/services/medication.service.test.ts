import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicationService } from '@/server/services/medication.service';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/server/services/notification.service';

// Mock the dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    medication: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    doseLog: {
      upsert: vi.fn(),
      deleteMany: vi.fn(),
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

describe('MedicationService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMedications', () => {
    it('returns active medications for the user when database is available', async () => {
      const mockMeds = [
        { id: 'med-1', name: 'Lisinopril', active: true, userId },
        { id: 'med-2', name: 'Metformin', active: true, userId },
      ];
      vi.mocked(prisma.medication.findMany).mockResolvedValue(mockMeds as any);

      const result = await MedicationService.listMedications(userId, true);
      expect(result).toEqual(mockMeds);
      expect(prisma.medication.findMany).toHaveBeenCalledWith({
        where: { userId, active: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns all medications regardless of active flag when activeOnly is false', async () => {
      vi.mocked(prisma.medication.findMany).mockResolvedValue([] as any);

      await MedicationService.listMedications(userId, false);
      expect(prisma.medication.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('falls back to mock medications if database query fails', async () => {
      vi.mocked(prisma.medication.findMany).mockRejectedValue(new Error('DB Connection Timeout'));

      const result = await MedicationService.listMedications(userId);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getMedicationById', () => {
    it('returns medication when found', async () => {
      const mockMed = { id: 'med-1', name: 'Lisinopril', userId };
      vi.mocked(prisma.medication.findUnique).mockResolvedValue(mockMed as any);

      const result = await MedicationService.getMedicationById('med-1');
      expect(result).toEqual(mockMed);
      expect(prisma.medication.findUnique).toHaveBeenCalledWith({ where: { id: 'med-1' } });
    });

    it('returns null when medication is not found or db throws', async () => {
      vi.mocked(prisma.medication.findUnique).mockRejectedValue(new Error('Not found'));

      const result = await MedicationService.getMedicationById('med-nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createMedication', () => {
    const newMedInput = {
      name: 'Atorvastatin',
      genericName: 'Lipitor',
      dosage: '20mg',
      form: 'tablet',
      purpose: 'Cholesterol management',
      frequency: 'Once daily at bedtime',
      scheduleTimes: ['21:00'],
      withFood: false,
      instructions: 'Take at night with water',
      prescribingDoctor: 'Dr. Robert Chen',
      refillCount: 45,
      totalQuantity: 90,
      color: '#3B82F6',
    };

    it('creates medication, generates today dose slots, dispatches notification, and records audit event', async () => {
      const createdMed = { id: 'med-new-1', ...newMedInput, userId, active: true };
      vi.mocked(prisma.medication.create).mockResolvedValue(createdMed as any);
      vi.mocked(prisma.doseLog.upsert).mockResolvedValue({ id: 'dose-new-1' } as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await MedicationService.createMedication(userId, newMedInput, 'Sarah Vance');

      expect(result).toEqual(createdMed);
      expect(prisma.medication.create).toHaveBeenCalled();
      expect(prisma.doseLog.upsert).toHaveBeenCalledTimes(1);
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: 'medication_reminder',
          title: 'New Prescription Added',
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            actorName: 'Sarah Vance',
            action: 'medication_added',
            entityId: 'med-new-1',
          }),
        })
      );
    });

    it('handles multiple schedule times and generates doses for each', async () => {
      const multiDoseMed = {
        ...newMedInput,
        scheduleTimes: ['08:00', '14:00', '20:00'],
      };
      vi.mocked(prisma.medication.create).mockResolvedValue({ id: 'med-multi-1', ...multiDoseMed } as any);
      vi.mocked(prisma.doseLog.upsert).mockResolvedValue({ id: 'dose-id' } as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      await MedicationService.createMedication(userId, multiDoseMed);
      expect(prisma.doseLog.upsert).toHaveBeenCalledTimes(3);
    });

    it('provides graceful fallback when database creation fails', async () => {
      vi.mocked(prisma.medication.create).mockRejectedValue(new Error('Prisma write failed'));

      const fallbackResult = await MedicationService.createMedication(userId, newMedInput);
      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.name).toBe(newMedInput.name);
      expect(fallbackResult.userId).toBe(userId);
    });
  });

  describe('updateMedication', () => {
    it('updates medication fields successfully', async () => {
      const updatedMed = { id: 'med-1', name: 'Lisinopril Updated', dosage: '20mg' };
      vi.mocked(prisma.medication.update).mockResolvedValue(updatedMed as any);

      const result = await MedicationService.updateMedication('med-1', { dosage: '20mg' });
      expect(result).toEqual(updatedMed);
      expect(prisma.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: expect.objectContaining({ dosage: '20mg' }),
      });
    });

    it('returns null on failure', async () => {
      vi.mocked(prisma.medication.update).mockRejectedValue(new Error('Update failed'));
      const result = await MedicationService.updateMedication('med-1', { dosage: '20mg' });
      expect(result).toBeNull();
    });
  });

  describe('deleteMedication', () => {
    it('soft-deletes medication and cleans up future pending doses', async () => {
      const deactivatedMed = { id: 'med-1', active: false };
      vi.mocked(prisma.medication.update).mockResolvedValue(deactivatedMed as any);
      vi.mocked(prisma.doseLog.deleteMany).mockResolvedValue({ count: 2 } as any);

      const result = await MedicationService.deleteMedication('med-1', userId);
      expect(result).toEqual(deactivatedMed);
      expect(prisma.medication.update).toHaveBeenCalledWith({
        where: { id: 'med-1' },
        data: { active: false },
      });
      expect(prisma.doseLog.deleteMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          medicationId: 'med-1',
          status: 'pending',
        }),
      });
    });

    it('returns fallback success on database failure', async () => {
      vi.mocked(prisma.medication.update).mockRejectedValue(new Error('Delete error'));
      const result = await MedicationService.deleteMedication('med-1', userId);
      expect(result).toEqual({ success: true });
    });
  });
});
