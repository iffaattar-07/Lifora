import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { AppointmentService } from '@/server/services/appointment.service';
import { CreateAppointmentSchema, createSuccessResponse, createErrorResponse } from '@/types/api';

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

    const appointments = await AppointmentService.listAppointments(targetUserId);
    return NextResponse.json(createSuccessResponse(appointments));
  } catch (err) {
    console.error('[Appointments GET API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to retrieve appointments'),
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
    const parsed = CreateAppointmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid appointment parameters', parsed.error.format()),
        { status: 400 }
      );
    }

    const targetUserId = body.userId || (user.role === 'elderly' ? user.id : 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d');
    const actorName = user.fullName || user.preferredName;

    const appointment = await AppointmentService.createAppointment(
      targetUserId,
      parsed.data,
      actorName
    );

    return NextResponse.json(createSuccessResponse(appointment), { status: 201 });
  } catch (err) {
    console.error('[Appointments POST API Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to schedule appointment'),
      { status: 500 }
    );
  }
}
