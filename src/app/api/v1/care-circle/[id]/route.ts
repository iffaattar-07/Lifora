import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { CareCircleService } from '@/server/services/care-circle.service';
import { UpdateCareCircleMemberSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const body = await req.json();
    const parsed = UpdateCareCircleMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid care circle member update', parsed.error.format()),
        { status: 400 }
      );
    }

    const updated = await CareCircleService.updateMember(id, parsed.data);
    return NextResponse.json(createSuccessResponse(updated));
  } catch (err) {
    console.error('[Care Circle Member PATCH API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to update member'),
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await CareCircleService.deleteMember(id);

    return NextResponse.json(
      createSuccessResponse({ success: true, message: 'Member removed from care circle' })
    );
  } catch (err) {
    console.error('[Care Circle Member DELETE API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to remove member'),
      { status: 500 }
    );
  }
}
