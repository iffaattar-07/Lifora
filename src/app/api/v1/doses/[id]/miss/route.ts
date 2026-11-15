import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { DoseService } from '@/server/services/dose.service';
import { MarkDoseMissedSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const body = await req.json();
    const parsed = MarkDoseMissedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'A valid reason for missing the dose is required', parsed.error.format()),
        { status: 400 }
      );
    }

    const actorName = user.fullName || user.preferredName;
    const actorRole = user.role;

    const updated = await DoseService.markDoseMissed(
      id,
      actorName,
      actorRole,
      parsed.data.reason
    );

    return NextResponse.json(
      createSuccessResponse({
        dose: updated,
        message: 'Dose marked as missed. Care circle has been notified.',
      })
    );
  } catch (err) {
    console.error('[Dose Miss POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to record dose as missed'),
      { status: 500 }
    );
  }
}
