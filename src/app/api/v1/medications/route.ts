import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, canManageMedications } from '@/server/security/rbac';
import { MedicationService } from '@/server/services/medication.service';
import { CreateMedicationSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const activeOnly = searchParams.get('active') !== 'false';

    const medications = await MedicationService.listMedications(targetUserId, activeOnly);
    return NextResponse.json(createSuccessResponse(medications));
  } catch (err) {
    console.error('[Medications GET API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve medications'),
      { status: 500 }
    );
  }
}

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
    const parsed = CreateMedicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid medication parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const targetUserId = body.userId || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');

    const hasPermission = await canManageMedications(user, targetUserId);
    if (!hasPermission) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'You do not have permission to modify prescriptions for this recipient'),
        { status: 403 }
      );
    }

    const medication = await MedicationService.createMedication(
      targetUserId,
      parsed.data,
      user.fullName || user.preferredName
    );

    return NextResponse.json(createSuccessResponse(medication), { status: 201 });
  } catch (err) {
    console.error('[Medications POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to create medication'),
      { status: 500 }
    );
  }
}
