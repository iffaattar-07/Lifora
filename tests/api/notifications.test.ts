import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleListNotifs } from '@/app/api/v1/notifications/route';
import { POST as handleReadAll } from '@/app/api/v1/notifications/read-all/route';
import { PATCH as handleMarkRead } from '@/app/api/v1/notifications/[id]/read/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/profile.service', () => ({
  ProfileService: {
    listNotifications: vi.fn(),
    markNotificationRead: vi.fn(),
    markAllNotificationsRead: vi.fn(),
  },
}));

describe('Notifications API Integration (/api/v1/notifications)', () => {
  const seniorUser = {
    id: 'user-margaret-1',
    email: 'margaret@lifora.demo',
    role: 'elderly' as const,
    fullName: 'Margaret Vance',
    preferredName: 'Margaret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/notifications', () => {
    it('returns 200 with list of care notifications for authorized user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.listNotifications).mockResolvedValue([
        {
          id: 'notif-1',
          type: 'medication_reminder',
          severity: 'info',
          title: 'Med Reminder',
          message: 'Lisinopril scheduled',
          timestamp: '2026-11-15T08:00:00Z',
          read: false,
        },
      ] as any);

      const req = new NextRequest('http://localhost:3005/api/v1/notifications');
      const response = await handleListNotifs(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/notifications');
      const response = await handleListNotifs(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/v1/notifications/[id]/read', () => {
    it('marks a single notification as read and returns 200', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.markNotificationRead).mockResolvedValue({
        id: 'notif-1',
        isRead: true,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/notifications/notif-1/read', {
        method: 'PATCH',
      });

      const context = { params: Promise.resolve({ id: 'notif-1' }) };
      const response = await handleMarkRead(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.isRead).toBe(true);
    });
  });

  describe('POST /api/v1/notifications/read-all', () => {
    it('marks all notifications as read and returns updated count', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.markAllNotificationsRead).mockResolvedValue({ count: 4 } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/notifications/read-all', {
        method: 'POST',
      });

      const response = await handleReadAll(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.count).toBe(4);
    });
  });
});
