import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';
import { createSuccessResponse, createErrorResponse } from '@/types/api';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication session required'),
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const updated = await ProfileService.markNotificationRead(id);

    return NextResponse.json(createSuccessResponse(updated));
  } catch (err) {
    console.error('[Notification Read PATCH API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to mark notification as read'),
      { status: 500 }
    );
  }
}
