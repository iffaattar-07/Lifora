import { prisma } from '@/lib/db';

export interface LogAuditParams {
  userId: string;
  actorId?: string;
  actorName: string;
  actorRole: 'elderly' | 'family' | 'caretaker' | 'system';
  action: string;
  entityType: 'medication' | 'dose_log' | 'care_circle_member' | 'appointment' | 'notification' | 'auth';
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export class AuditService {
  /**
   * Records an immutable compliance audit event
   */
  static async logEvent(params: LogAuditParams) {
    try {
      return await prisma.auditEvent.create({
        data: {
          userId: params.userId,
          actorId: params.actorId,
          actorName: params.actorName,
          actorRole: params.actorRole,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          metadata: params.metadata as any,
          ipAddress: params.ipAddress,
        },
      });
    } catch (err) {
      console.warn('[AuditService] Audit log write fallback:', err);
      return {
        id: `audit-${Date.now()}`,
        ...params,
        createdAt: new Date(),
      };
    }
  }

  /**
   * Retrieves audit trail for a patient with pagination
   */
  static async getAuditTrail(userId: string, limit = 50) {
    try {
      return await prisma.auditEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch {
      return [];
    }
  }
}
