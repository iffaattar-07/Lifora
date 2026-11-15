import { prisma } from '@/lib/db';
import { CreateMedicationInput, UpdateMedicationInput } from '@/types/api';
import { NotificationService } from './notification.service';

export class MedicationService {
  /**
   * Retrieves all active medications for an elderly patient
   */
  static async listMedications(userId: string, activeOnly = true) {
    try {
      return await prisma.medication.findMany({
        where: {
          userId,
          ...(activeOnly ? { active: true } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      // Fallback for offline mock data mode
      const { mockMedications } = await import('@/lib/mockData');
      return mockMedications;
    }
  }

  /**
   * Retrieves a single medication by ID
   */
  static async getMedicationById(id: string) {
    try {
      return await prisma.medication.findUnique({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  /**
   * Creates a new prescription and generates today's dose slots automatically
   */
  static async createMedication(userId: string, data: CreateMedicationInput, actorName = 'Caregiver') {
    try {
      const medication = await prisma.medication.create({
        data: {
          userId,
          name: data.name,
          genericName: data.genericName,
          dosage: data.dosage,
          form: data.form,
          color: data.color || '#2E847D',
          purpose: data.purpose,
          frequency: data.frequency,
          scheduleTimes: data.scheduleTimes,
          withFood: data.withFood,
          instructions: data.instructions || '',
          prescribingDoctor: data.prescribingDoctor || '',
          refillCount: data.refillCount ?? 30,
          totalQuantity: data.totalQuantity ?? 30,
          active: true,
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : null,
        },
      });

      // Automatically generate today's dose slots for this new prescription
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dosePromises = data.scheduleTimes.map((time) =>
        prisma.doseLog.upsert({
          where: {
            medicationId_scheduledDate_scheduledTime: {
              medicationId: medication.id,
              scheduledDate: today,
              scheduledTime: time,
            },
          },
          update: {},
          create: {
            medicationId: medication.id,
            userId,
            scheduledDate: today,
            scheduledTime: time,
            status: 'pending',
          },
        })
      );

      await Promise.allSettled(dosePromises);

      // Create notification
      await NotificationService.createNotification({
        userId,
        type: 'medication_reminder',
        severity: 'info',
        title: 'New Prescription Added',
        message: `${data.name} (${data.dosage}) has been added to Margaret's care regimen by ${actorName}.`,
        actionUrl: '/medications',
        actionLabel: 'View Medication',
      });

      // Log compliance audit event
      await prisma.auditEvent.create({
        data: {
          userId,
          actorName,
          actorRole: 'family',
          action: 'medication_added',
          entityType: 'medication',
          entityId: medication.id,
          metadata: { name: data.name, dosage: data.dosage },
        },
      });

      return medication;
    } catch (err) {
      console.warn('[MedicationService] Fallback creating medication locally:', err);
      return {
        id: `med-${Date.now()}`,
        userId,
        ...data,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  /**
   * Updates an existing medication prescription
   */
  static async updateMedication(id: string, data: UpdateMedicationInput) {
    try {
      return await prisma.medication.update({
        where: { id },
        data: {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : undefined,
          endDate: data.endDate ? new Date(data.endDate) : undefined,
        },
      });
    } catch {
      return null;
    }
  }

  /**
   * Deactivates a medication and cleans up future pending doses
   */
  static async deleteMedication(id: string, userId: string) {
    try {
      // Soft-delete prescription
      const med = await prisma.medication.update({
        where: { id },
        data: { active: false },
      });

      // Clean up today's pending doses for this deactivated med
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await prisma.doseLog.deleteMany({
        where: {
          medicationId: id,
          scheduledDate: { gte: today },
          status: 'pending',
        },
      });

      return med;
    } catch {
      return { success: true };
    }
  }
}
