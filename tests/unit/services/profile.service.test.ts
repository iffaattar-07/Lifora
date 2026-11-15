import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from '@/server/services/profile.service';
import { prisma } from '@/lib/db';
import { DoseService } from '@/server/services/dose.service';
import { MedicationService } from '@/server/services/medication.service';
import { AppointmentService } from '@/server/services/appointment.service';
import { CareCircleService } from '@/server/services/care-circle.service';

vi.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    careNotification: {
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock('@/server/services/dose.service', () => ({
  DoseService: {
    getTodaySchedule: vi.fn(),
  },
}));

vi.mock('@/server/services/medication.service', () => ({
  MedicationService: {
    listMedications: vi.fn(),
  },
}));

vi.mock('@/server/services/appointment.service', () => ({
  AppointmentService: {
    listAppointments: vi.fn(),
  },
}));

vi.mock('@/server/services/care-circle.service', () => ({
  CareCircleService: {
    listMembers: vi.fn(),
  },
}));

describe('ProfileService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns formatted profile when user exists in database', async () => {
      const dbProfile = {
        id: userId,
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        age: 78,
        dob: new Date('1946-04-12'),
        bloodType: 'A+',
        avatarUrl: '/avatars/margaret.jpg',
        phone: '(503) 555-0188',
        address: '482 Maplewood Drive, Portland, OR 97201',
        timezone: 'America/Los_Angeles',
        primaryConditions: ['Hypertension', 'Type 2 Diabetes'],
        knownAllergies: ['Penicillin', 'Sulfa drugs'],
        emergencyContact: { name: 'Sarah Vance', phone: '(503) 555-0192' },
        primaryPhysician: { name: 'Dr. Robert Hayes', clinic: 'Providence Heart Clinic' },
      };
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(dbProfile as any);

      const result = await ProfileService.getProfile(userId);

      expect(result.id).toBe(userId);
      expect(result.fullName).toBe('Margaret Vance');
      expect(result.dob).toBe('1946-04-12');
      expect(result.primaryConditions).toEqual(['Hypertension', 'Type 2 Diabetes']);
    });

    it('falls back to mockUserProfile when profile is not found or DB fails', async () => {
      vi.mocked(prisma.profile.findUnique).mockRejectedValue(new Error('Profile query failed'));

      const result = await ProfileService.getProfile(userId);
      expect(result).toBeDefined();
      expect(result.fullName).toBe('Margaret Vance');
    });
  });

  describe('updateProfile', () => {
    it('updates patient profile details', async () => {
      const updateData = {
        fullName: 'Margaret Vance Updated',
        age: 79,
        dob: '1946-04-12',
      };
      vi.mocked(prisma.profile.update).mockResolvedValue({ id: userId, ...updateData } as any);

      const result = await ProfileService.updateProfile(userId, updateData);

      expect(result.fullName).toBe('Margaret Vance Updated');
      expect(prisma.profile.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({
            fullName: 'Margaret Vance Updated',
            age: 79,
          }),
        })
      );
    });

    it('provides fallback object on DB update failure', async () => {
      vi.mocked(prisma.profile.update).mockRejectedValue(new Error('Update failed'));

      const result = await ProfileService.updateProfile(userId, { fullName: 'Fallback' });
      expect(result).toEqual({ id: userId, fullName: 'Fallback' });
    });
  });

  describe('getDashboard (Aggregated Clinical State)', () => {
    it('aggregates profile, todaySchedule, adherenceStats, medications, appointments, careCircle, and notifications in parallel', async () => {
      vi.mocked(prisma.profile.findUnique).mockResolvedValue({ id: userId, fullName: 'Margaret Vance' } as any);
      vi.mocked(DoseService.getTodaySchedule).mockResolvedValue({
        schedule: [{ id: 'dose-1' }],
        adherenceStats: { todayPercentage: 80 },
      } as any);
      vi.mocked(MedicationService.listMedications).mockResolvedValue([{ id: 'med-1' }] as any);
      vi.mocked(AppointmentService.listAppointments).mockResolvedValue([{ id: 'apt-1' }] as any);
      vi.mocked(CareCircleService.listMembers).mockResolvedValue([{ id: 'member-1' }] as any);
      vi.mocked(prisma.careNotification.findMany).mockResolvedValue([
        {
          id: 'notif-1',
          type: 'medication_reminder',
          severity: 'info',
          title: 'Dose',
          message: 'Take pill',
          createdAt: new Date('2026-11-15T08:00:00Z'),
          isRead: false,
        },
      ] as any);

      const dashboard = await ProfileService.getDashboard(userId);

      expect(dashboard.profile).toBeDefined();
      expect(dashboard.todaySchedule).toHaveLength(1);
      expect(dashboard.adherenceStats.todayPercentage).toBe(80);
      expect(dashboard.medications).toHaveLength(1);
      expect(dashboard.appointments).toHaveLength(1);
      expect(dashboard.careCircle).toHaveLength(1);
      expect(dashboard.notifications).toHaveLength(1);
    });
  });

  describe('Notification Management (list, mark read, mark all read)', () => {
    it('lists formatted care notifications up to 20 ordered by recency', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'system',
          severity: 'info',
          title: 'Welcome',
          message: 'Welcome to Lifora',
          createdAt: new Date('2026-11-15T09:00:00Z'),
          isRead: false,
        },
      ];
      vi.mocked(prisma.careNotification.findMany).mockResolvedValue(mockNotifications as any);

      const result = await ProfileService.listNotifications(userId);

      expect(result).toHaveLength(1);
      expect(result[0].read).toBe(false);
      expect(result[0].timestamp).toBe('2026-11-15T09:00:00.000Z');
      expect(prisma.careNotification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('marks a single notification as read', async () => {
      vi.mocked(prisma.careNotification.update).mockResolvedValue({ id: 'notif-1', isRead: true } as any);

      const result = await ProfileService.markNotificationRead('notif-1');
      expect(result.isRead).toBe(true);
      expect(prisma.careNotification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: { isRead: true },
      });
    });

    it('marks all notifications as read for a user', async () => {
      vi.mocked(prisma.careNotification.updateMany).mockResolvedValue({ count: 5 });

      const result = await ProfileService.markAllNotificationsRead(userId);
      expect(result).toEqual({ count: 5 });
      expect(prisma.careNotification.updateMany).toHaveBeenCalledWith({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    });
  });
});
