import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { NotificationService } from '@/server/services/notification.service';
import { EmergencyBroadcastSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication session required'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = EmergencyBroadcastSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Emergency broadcast requires a reason', parsed.error.format()),
        { status: 400 }
      );
    }

    const targetUserId = body.userId || user.id;
    const coords = (parsed.data.latitude && parsed.data.longitude)
      ? { lat: parsed.data.latitude, lng: parsed.data.longitude }
      : undefined;

    const result = await NotificationService.broadcastEmergencySOS(
      targetUserId,
      parsed.data.reason,
      coords
    );

    return NextResponse.json(createSuccessResponse(result), { status: 202 });
  } catch (err) {
    console.error('[Care Circle Emergency POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to dispatch emergency broadcast'),
      { status: 500 }
    );
  }
}
