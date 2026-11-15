import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';
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
    // If a caregiver passes a specific recipient ID (or default to demo Margaret)
    const recipientId = searchParams.get('recipientId') || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');

    const dashboard = await ProfileService.getDashboard(recipientId);
    return NextResponse.json(createSuccessResponse(dashboard));
  } catch (err) {
    console.error('[Dashboard GET API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve dashboard data'),
      { status: 500 }
    );
  }
}
