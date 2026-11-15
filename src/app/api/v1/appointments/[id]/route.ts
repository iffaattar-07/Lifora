import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { AppointmentService } from '@/server/services/appointment.service';
import { UpdateAppointmentSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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
    const parsed = UpdateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid appointment update parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const updated = await AppointmentService.updateAppointment(id, parsed.data);
    return NextResponse.json(createSuccessResponse(updated));
  } catch (err) {
    console.error('[Appointment PATCH API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to update appointment'),
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
    const { searchParams } = new URL(req.url);
    const reason = searchParams.get('reason') || 'Cancelled by user';

    await AppointmentService.cancelAppointment(id, reason);
    return NextResponse.json(
      createSuccessResponse({ success: true, message: 'Appointment cancelled successfully' })
    );
  } catch (err) {
    console.error('[Appointment DELETE API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to cancel appointment'),
      { status: 500 }
    );
  }
}
