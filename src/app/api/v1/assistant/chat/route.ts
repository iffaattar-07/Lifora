import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { AssistantService } from '@/server/services/assistant.service';
import { AssistantChatSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const parsed = AssistantChatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'A non-empty query message is required', parsed.error.format()),
        { status: 400 }
      );
    }

    const targetUserId = body.userId || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');

    const result = await AssistantService.processQuery(targetUserId, parsed.data.message);

    return NextResponse.json(createSuccessResponse(result));
  } catch (err) {
    console.error('[Assistant Chat POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to generate assistant reply'),
      { status: 500 }
    );
  }
}
