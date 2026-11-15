import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditService } from '@/server/services/audit.service';
import { prisma } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  prisma: {
    auditEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('AuditService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logEvent', () => {
    it('creates immutable compliance audit log in database', async () => {
      const mockEvent = {
        id: 'audit-log-1',
        userId,
        actorId: 'sarah-123',
        actorName: 'Sarah Vance',
        actorRole: 'family' as const,
        action: 'medication_added',
        entityType: 'medication' as const,
        entityId: 'med-1',
        metadata: { name: 'Lisinopril', dosage: '10mg' },
      };

      vi.mocked(prisma.auditEvent.create).mockResolvedValue(mockEvent as any);

      const result = await AuditService.logEvent(mockEvent);

      expect(result).toEqual(mockEvent);
      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId,
          actorName: 'Sarah Vance',
          action: 'medication_added',
          entityType: 'medication',
        }),
      });
    });

    it('falls back gracefully when database write throws', async () => {
      vi.mocked(prisma.auditEvent.create).mockRejectedValue(new Error('Write restricted'));

      const result = await AuditService.logEvent({
        userId,
        actorName: 'Margaret Vance',
        actorRole: 'elderly',
        action: 'dose_taken',
        entityType: 'dose_log',
      });

      expect(result).toBeDefined();
      expect(result.id).toContain('audit-');
      expect(result.action).toBe('dose_taken');
    });
  });

  describe('getAuditTrail', () => {
    it('retrieves audit trail ordered by creation time descending', async () => {
      const mockLogs = [
        { id: 'log-1', action: 'dose_taken', createdAt: new Date() },
        { id: 'log-2', action: 'appointment_scheduled', createdAt: new Date() },
      ];
      vi.mocked(prisma.auditEvent.findMany).mockResolvedValue(mockLogs as any);

      const result = await AuditService.getAuditTrail(userId, 20);

      expect(result).toHaveLength(2);
      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    });

    it('returns empty array on database error', async () => {
      vi.mocked(prisma.auditEvent.findMany).mockRejectedValue(new Error('DB failure'));

      const result = await AuditService.getAuditTrail(userId);
      expect(result).toEqual([]);
    });
  });
});
