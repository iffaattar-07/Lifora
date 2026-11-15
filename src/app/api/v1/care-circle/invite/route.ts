import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { CareCircleService } from '@/server/services/care-circle.service';
import { InviteCareCircleMemberSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const parsed = InviteCareCircleMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid care circle member invitation', parsed.error.format()),
        { status: 400 }
      );
    }

    const targetUserId = body.userId || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');
    const inviterName = user.fullName || user.preferredName;

    const member = await CareCircleService.inviteMember(targetUserId, parsed.data, inviterName);

    return NextResponse.json(createSuccessResponse(member), { status: 201 });
  } catch (err) {
    console.error('[Care Circle Invite POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to invite care circle member'),
      { status: 500 }
    );
  }
}
