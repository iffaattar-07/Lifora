import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { DoseService } from '@/server/services/dose.service';
import { MarkDoseTakenSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

export async function POST(
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
    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const parsed = MarkDoseTakenSchema.safeParse(body);
    const actorName = user.fullName || user.preferredName;
    const actorRole = user.role;

    const updated = await DoseService.markDoseTaken(
      id,
      actorName,
      actorRole,
      parsed.success ? parsed.data.takenAt : undefined
    );

    return NextResponse.json(
      createSuccessResponse({
        dose: updated,
        message: 'Dose recorded as taken successfully',
      })
    );
  } catch (err) {
    console.error('[Dose Take POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to record dose as taken'),
      { status: 500 }
    );
  }
}
