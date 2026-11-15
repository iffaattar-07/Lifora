import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';
import { UpdateProfileRequestSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const targetUserId = searchParams.get('userId') || user.id;

    const profile = await ProfileService.getProfile(targetUserId);
    return NextResponse.json(createSuccessResponse(profile));
  } catch (err) {
    console.error('[Profile GET API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve profile'),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication session required'),
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = UpdateProfileRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid profile update parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const updated = await ProfileService.updateProfile(user.id, parsed.data);
    return NextResponse.json(createSuccessResponse(updated));
  } catch (err) {
    console.error('[Profile PUT API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to update profile'),
      { status: 500 }
    );
  }
}
