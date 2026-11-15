import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, canManageMedications } from '@/server/security/rbac';
import { MedicationService } from '@/server/services/medication.service';
import { UpdateMedicationSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const parsed = UpdateMedicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid medication update parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const med = await MedicationService.getMedicationById(id);
    if (med) {
      const hasPermission = await canManageMedications(user, med.userId);
      if (!hasPermission) {
        return NextResponse.json(
          createErrorResponse('FORBIDDEN', 'Insufficient permissions to update this prescription'),
          { status: 403 }
        );
      }
    }

    const updated = await MedicationService.updateMedication(id, parsed.data);
    return NextResponse.json(createSuccessResponse(updated));
  } catch (err) {
    console.error('[Medication PATCH API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to update medication'),
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
    const med = await MedicationService.getMedicationById(id);
    const targetUserId = med?.userId || user.id;

    const hasPermission = await canManageMedications(user, targetUserId);
    if (!hasPermission) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Insufficient permissions to remove this prescription'),
        { status: 403 }
      );
    }

    await MedicationService.deleteMedication(id, targetUserId);
    return NextResponse.json(createSuccessResponse({ success: true, message: 'Prescription deactivated' }));
  } catch (err) {
    console.error('[Medication DELETE API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to delete medication'),
      { status: 500 }
    );
  }
}
