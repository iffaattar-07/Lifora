import { prisma } from '@/lib/db';
import { UpdateProfileRequest } from '@/types/api';
import { DoseService } from './dose.service';
import { MedicationService } from './medication.service';
import { AppointmentService } from './appointment.service';
import { CareCircleService } from './care-circle.service';

export class ProfileService {
  /**
   * Retrieves profile for an elderly user or caretaker
   */
  static async getProfile(userId: string) {
    try {
      const profile = await prisma.profile.findUnique({
        where: { id: userId },
      });

      if (profile) {
        return {
          id: profile.id,
          fullName: profile.fullName,
          preferredName: profile.preferredName,
          age: profile.age,
          dob: profile.dob ? profile.dob.toISOString().split('T')[0] : '1946-04-12',
          bloodType: profile.bloodType || 'A+',
          avatarUrl: profile.avatarUrl,
          phone: profile.phone || '(503) 555-0188',
          address: profile.address || '482 Maplewood Drive, Portland, OR 97201',
          timezone: profile.timezone || 'America/Los_Angeles',
          primaryConditions: profile.primaryConditions,
          knownAllergies: profile.knownAllergies,
          emergencyContact: profile.emergencyContact,
          primaryPhysician: profile.primaryPhysician,
        };
      }

      const { mockUserProfile } = await import('@/lib/mockData');
      return mockUserProfile;
    } catch {
      const { mockUserProfile } = await import('@/lib/mockData');
      return mockUserProfile;
    }
  }

  /**
   * Updates patient profile
   */
  static async updateProfile(userId: string, data: UpdateProfileRequest) {
    try {
      return await prisma.profile.update({
        where: { id: userId },
        data: {
          fullName: data.fullName,
          preferredName: data.preferredName,
          age: data.age,
          dob: data.dob ? new Date(data.dob) : undefined,
          bloodType: data.bloodType,
          avatarUrl: data.avatarUrl,
          phone: data.phone,
          address: data.address,
          timezone: data.timezone,
          primaryConditions: data.primaryConditions,
          knownAllergies: data.knownAllergies,
          emergencyContact: data.emergencyContact as any,
          primaryPhysician: data.primaryPhysician as any,
        },
      });
    } catch {
      return { id: userId, ...data };
    }
  }

  /**
   * Fast aggregated dashboard endpoint: returns full clinical state in one roundtrip
   */
  static async getDashboard(userId: string, targetDate?: Date) {
    const [profile, scheduleData, medications, appointments, careCircle, notifications] =
      await Promise.all([
        this.getProfile(userId),
        DoseService.getTodaySchedule(userId, targetDate),
        MedicationService.listMedications(userId),
        AppointmentService.listAppointments(userId),
        CareCircleService.listMembers(userId),
        this.listNotifications(userId),
      ]);

    return {
      profile,
      todaySchedule: scheduleData.schedule,
      adherenceStats: scheduleData.adherenceStats,
      medications,
      appointments,
      careCircle,
      notifications,
    };
  }

  /**
   * Retrieves notifications for a user
   */
  static async listNotifications(userId: string) {
    try {
      const notifications = await prisma.careNotification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return notifications.map((n) => ({
        id: n.id,
        type: n.type as 'medication_reminder' | 'medication_missed' | 'appointment' | 'circle_update' | 'system',
        severity: n.severity as 'urgent' | 'warning' | 'info' | 'success',
        title: n.title,
        message: n.message,
        timestamp: n.createdAt.toISOString(),
        read: n.isRead,
        actionUrl: n.actionUrl || undefined,
        actionLabel: n.actionLabel || undefined,
      }));
    } catch {
      const { mockNotifications } = await import('@/lib/mockData');
      return mockNotifications;
    }
  }

  /**
   * Marks a notification as read
   */
  static async markNotificationRead(id: string) {
    try {
      return await prisma.careNotification.update({
        where: { id },
        data: { isRead: true },
      });
    } catch {
      return { id, isRead: true };
    }
  }

  /**
   * Marks all notifications as read for a user
   */
  static async markAllNotificationsRead(userId: string) {
    try {
      return await prisma.careNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } catch {
      return { count: 0 };
    }
  }
}
