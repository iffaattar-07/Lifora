import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { CareCircleService } from '@/server/services/care-circle.service';
import { createSuccessResponse, createErrorResponse } from '@/types/api';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication session required'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId') || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');

    const members = await CareCircleService.listMembers(targetUserId);
    return NextResponse.json(createSuccessResponse(members));
  } catch (err) {
    console.error('[Care Circle GET API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve care circle members'),
      { status: 500 }
    );
  }
}
