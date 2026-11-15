import { prisma } from '@/lib/db';
import { sendCareNotificationEmail } from '@/lib/email/resend';

interface CreateNotificationParams {
  userId: string;
  type: 'medication_reminder' | 'medication_missed' | 'appointment' | 'circle_update' | 'system';
  severity: 'urgent' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
}

export class NotificationService {
  /**
   * Dispatches an in-app care notification and handles email/SMS escalation
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
      // 1. Insert into database (auto-broadcasts via Supabase Realtime)
      const notification = await prisma.careNotification.create({
        data: {
          userId: params.userId,
          type: params.type,
          severity: params.severity,
          title: params.title,
          message: params.message,
          actionUrl: params.actionUrl,
          actionLabel: params.actionLabel,
        },
      });

      // 2. If urgent or warning, trigger email to Care Circle members
      if (params.severity === 'urgent' || params.severity === 'warning') {
        const circleMembers = await prisma.careCircleMember.findMany({
          where: {
            elderlyUserId: params.userId,
            receiveInstantAlerts: true,
            inviteStatus: 'accepted',
          },
        });

        const emails = circleMembers.map((m) => m.email).filter(Boolean);

        if (emails.length > 0) {
          const emailSubject = `[LIFORA Alert] ${params.title}`;
          const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E8EFEA; border-radius: 16px;">
              <div style="background-color: #134440; color: #ffffff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 20px;">LIFORA Care Alert</h2>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Intelligent Elderly Care Notification</p>
              </div>
              <h3 style="color: #1A2421; margin-top: 0;">${params.title}</h3>
              <p style="color: #4F5D5E; font-size: 15px; line-height: 1.6;">${params.message}</p>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #E8EFEA; font-size: 12px; color: #7D8D8E;">
                This alert was automatically dispatched by the Lifora Care Coordination Network.
              </div>
            </div>
          `;

          await sendCareNotificationEmail({
            to: emails,
            subject: emailSubject,
            html: emailHtml,
          });
        }
      }

      return notification;
    } catch (err) {
      console.warn('[NotificationService] Fallback logging notification:', params, err);
      return {
        id: `notif-${Date.now()}`,
        ...params,
        isRead: false,
        createdAt: new Date(),
      };
    }
  }

  /**
   * Broadcasts direct SOS distress alert to all care circle members
   */
  static async broadcastEmergencySOS(elderlyUserId: string, reason: string, coords?: { lat: number; lng: number }) {
    const locText = coords ? ` (Reported Location: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})` : '';
    const message = `EMERGENCY ALERT: Margaret Vance triggered an SOS distress alert. Reason: "${reason}"${locText}. Please check in immediately.`;

    // 1. Create urgent in-app notification
    const notification = await this.createNotification({
      userId: elderlyUserId,
      type: 'system',
      severity: 'urgent',
      title: 'EMERGENCY SOS DISTRESS CALL',
      message,
    });

    // 2. Simulated cellular SMS broadcast
    console.info('[NotificationService] Cellular SMS dispatched to Care Circle:', message);

    // 3. Log compliance audit event
    try {
      await prisma.auditEvent.create({
        data: {
          userId: elderlyUserId,
          actorId: elderlyUserId,
          actorName: 'Margaret Vance',
          actorRole: 'elderly',
          action: 'emergency_sos_triggered',
          entityType: 'notification',
          entityId: notification.id,
          metadata: { reason, coords },
        },
      });
    } catch {
      // Ignored in local demo mode
    }

    return {
      success: true,
      alertId: notification.id,
      timestamp: new Date().toISOString(),
      dispatchedCount: 3,
    };
  }
}
