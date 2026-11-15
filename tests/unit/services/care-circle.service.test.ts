import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CareCircleService } from '@/server/services/care-circle.service';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/server/services/notification.service';

vi.mock('@/lib/db', () => ({
  prisma: {
    careCircleMember: {
      findMany: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

describe('CareCircleService', () => {
  const elderlyUserId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listMembers', () => {
    it('returns ordered members list with emergency contacts first', async () => {
      const mockMembers = [
        {
          id: 'member-1',
          name: 'Sarah Vance',
          relation: 'Daughter (Primary)',
          role: 'family',
          phone: '(503) 555-0192',
          email: 'sarah@lifora.demo',
          isEmergencyContact: true,
          canManageMeds: true,
          receiveInstantAlerts: true,
          inviteStatus: 'accepted',
        },
        {
          id: 'member-2',
          name: 'Dr. Robert Hayes',
          relation: 'Primary Cardiologist',
          role: 'caretaker',
          phone: '(503) 555-0144',
          email: 'dr.hayes@lifora.demo',
          isEmergencyContact: false,
          canManageMeds: false,
          receiveInstantAlerts: true,
          inviteStatus: 'accepted',
        },
      ];

      vi.mocked(prisma.careCircleMember.findMany).mockResolvedValue(mockMembers as any);

      const result = await CareCircleService.listMembers(elderlyUserId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Sarah Vance');
      expect(result[0].isEmergencyContact).toBe(true);
      expect(prisma.careCircleMember.findMany).toHaveBeenCalledWith({
        where: { elderlyUserId },
        orderBy: [{ isEmergencyContact: 'desc' }, { createdAt: 'asc' }],
      });
    });

    it('falls back to mockCareCircle when database throws', async () => {
      vi.mocked(prisma.careCircleMember.findMany).mockRejectedValue(new Error('DB unreachable'));

      const result = await CareCircleService.listMembers(elderlyUserId);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('inviteMember', () => {
    const inviteInput = {
      name: 'James Vance',
      relation: 'Son',
      role: 'family' as const,
      phone: '(503) 555-0188',
      email: 'james@vance.family',
      isEmergencyContact: true,
      canManageMeds: true,
      receiveInstantAlerts: true,
    };

    it('unsets existing emergency contact if new member is emergency contact, creates member, notifies circle, and logs audit', async () => {
      const createdMember = { id: 'member-3', ...inviteInput, elderlyUserId, inviteStatus: 'accepted' };
      vi.mocked(prisma.careCircleMember.updateMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.careCircleMember.create).mockResolvedValue(createdMember as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await CareCircleService.inviteMember(elderlyUserId, inviteInput, 'Sarah Vance');

      expect(result).toEqual(createdMember);
      expect(prisma.careCircleMember.updateMany).toHaveBeenCalledWith({
        where: { elderlyUserId, isEmergencyContact: true },
        data: { isEmergencyContact: false },
      });
      expect(prisma.careCircleMember.create).toHaveBeenCalled();
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: elderlyUserId,
          type: 'circle_update',
          title: 'New Care Circle Member Joined',
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'care_circle_invite',
            entityId: 'member-3',
          }),
        })
      );
    });

    it('does not unset emergency contact when isEmergencyContact is false', async () => {
      const regularInvite = { ...inviteInput, isEmergencyContact: false };
      vi.mocked(prisma.careCircleMember.create).mockResolvedValue({ id: 'member-4', ...regularInvite } as any);

      await CareCircleService.inviteMember(elderlyUserId, regularInvite);

      expect(prisma.careCircleMember.updateMany).not.toHaveBeenCalled();
      expect(prisma.careCircleMember.create).toHaveBeenCalled();
    });

    it('handles fallback gracefully when database throws', async () => {
      vi.mocked(prisma.careCircleMember.create).mockRejectedValue(new Error('DB failure'));

      const result = await CareCircleService.inviteMember(elderlyUserId, inviteInput);
      expect(result).toBeDefined();
      expect(result.name).toBe(inviteInput.name);
      expect(result.elderlyUserId).toBe(elderlyUserId);
    });
  });

  describe('updateMember', () => {
    it('updates member details and permissions', async () => {
      const updateData = { canManageMeds: false, receiveInstantAlerts: true };
      const updatedMember = { id: 'member-1', ...updateData };
      vi.mocked(prisma.careCircleMember.update).mockResolvedValue(updatedMember as any);

      const result = await CareCircleService.updateMember('member-1', updateData);

      expect(result).toEqual(updatedMember);
      expect(prisma.careCircleMember.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: expect.objectContaining({ canManageMeds: false, receiveInstantAlerts: true }),
      });
    });

    it('returns null on failure', async () => {
      vi.mocked(prisma.careCircleMember.update).mockRejectedValue(new Error('Update failed'));

      const result = await CareCircleService.updateMember('member-1', { name: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('deleteMember', () => {
    it('deletes member by ID', async () => {
      vi.mocked(prisma.careCircleMember.delete).mockResolvedValue({ id: 'member-1' } as any);

      const result = await CareCircleService.deleteMember('member-1');
      expect(result).toEqual({ id: 'member-1' });
      expect(prisma.careCircleMember.delete).toHaveBeenCalledWith({ where: { id: 'member-1' } });
    });

    it('returns fallback success on database delete failure', async () => {
      vi.mocked(prisma.careCircleMember.delete).mockRejectedValue(new Error('Delete error'));

      const result = await CareCircleService.deleteMember('member-1');
      expect(result).toEqual({ success: true });
    });
  });
});
