import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';
import { createSuccessResponse, createErrorResponse } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication session required'),
        { status: 401 }
      );
    }

    const targetUserId = user.id;
    const result = await ProfileService.markAllNotificationsRead(targetUserId);

    return NextResponse.json(createSuccessResponse(result));
  } catch (err) {
    console.error('[Notifications Read All POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to mark all notifications as read'),
      { status: 500 }
    );
  }
}
