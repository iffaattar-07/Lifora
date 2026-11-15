import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from '@/server/services/notification.service';
import { prisma } from '@/lib/db';
import { sendCareNotificationEmail } from '@/lib/email/resend';

vi.mock('@/lib/db', () => ({
  prisma: {
    careNotification: {
      create: vi.fn(),
    },
    careCircleMember: {
      findMany: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email/resend', () => ({
  sendCareNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('NotificationService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNotification', () => {
    it('creates info notification without triggering outbound emails', async () => {
      const mockCreated = {
        id: 'notif-1',
        userId,
        type: 'medication_reminder',
        severity: 'info',
        title: 'Medication Reminder',
        message: 'Lisinopril scheduled for 08:00 AM',
      };
      vi.mocked(prisma.careNotification.create).mockResolvedValue(mockCreated as any);

      const result = await NotificationService.createNotification(mockCreated as any);

      expect(result).toEqual(mockCreated);
      expect(prisma.careNotification.create).toHaveBeenCalled();
      expect(prisma.careCircleMember.findMany).not.toHaveBeenCalled();
      expect(sendCareNotificationEmail).not.toHaveBeenCalled();
    });

    it('triggers outbound email alert to care circle members when severity is warning or urgent', async () => {
      const warningNotif = {
        id: 'notif-warning-1',
        userId,
        type: 'medication_missed' as const,
        severity: 'warning' as const,
        title: 'Missed Medication Alert',
        message: 'Margaret missed 13:00 Metformin dose',
      };
      vi.mocked(prisma.careNotification.create).mockResolvedValue(warningNotif as any);
      vi.mocked(prisma.careCircleMember.findMany).mockResolvedValue([
        { email: 'sarah@lifora.demo' },
        { email: 'james@vance.family' },
      ] as any);

      const result = await NotificationService.createNotification(warningNotif);

      expect(result).toEqual(warningNotif);
      expect(prisma.careCircleMember.findMany).toHaveBeenCalledWith({
        where: {
          elderlyUserId: userId,
          receiveInstantAlerts: true,
          inviteStatus: 'accepted',
        },
      });
      expect(sendCareNotificationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['sarah@lifora.demo', 'james@vance.family'],
          subject: '[LIFORA Alert] Missed Medication Alert',
          html: expect.stringContaining('Missed Medication Alert'),
        })
      );
    });

    it('handles fallback gracefully when database throws', async () => {
      vi.mocked(prisma.careNotification.create).mockRejectedValue(new Error('DB unavailable'));

      const fallbackResult = await NotificationService.createNotification({
        userId,
        type: 'system',
        severity: 'info',
        title: 'Test',
        message: 'Fallback test',
      });

      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.id).toContain('notif-');
      expect(fallbackResult.isRead).toBe(false);
    });
  });

  describe('broadcastEmergencySOS', () => {
    it('creates urgent system notification, triggers SMS broadcast simulation, and logs audit', async () => {
      const urgentNotif = {
        id: 'notif-urgent-sos',
        userId,
        type: 'system',
        severity: 'urgent',
        title: 'EMERGENCY SOS DISTRESS CALL',
        message: 'EMERGENCY ALERT',
      };
      vi.mocked(prisma.careNotification.create).mockResolvedValue(urgentNotif as any);
      vi.mocked(prisma.careCircleMember.findMany).mockResolvedValue([
        { email: 'sarah@lifora.demo' },
      ] as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-sos' } as any);

      const result = await NotificationService.broadcastEmergencySOS(
        userId,
        'Severe chest discomfort',
        { lat: 45.5152, lng: -122.6784 }
      );

      expect(result.success).toBe(true);
      expect(result.alertId).toBe('notif-urgent-sos');
      expect(result.dispatchedCount).toBe(3);
      expect(prisma.careNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            severity: 'urgent',
            title: 'EMERGENCY SOS DISTRESS CALL',
            message: expect.stringContaining('Severe chest discomfort'),
          }),
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'emergency_sos_triggered',
            actorRole: 'elderly',
          }),
        })
      );
    });
  });
});
