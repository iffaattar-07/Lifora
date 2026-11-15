import { NextRequest, NextResponse } from 'next/server';
import { DoseService } from '@/server/services/dose.service';
import { createSuccessResponse, createErrorResponse } from '@/types/api';

export async function GET(req: NextRequest) {
  return handleMissedDoseCheck(req);
}

export async function POST(req: NextRequest) {
  return handleMissedDoseCheck(req);
}

async function handleMissedDoseCheck(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify cron authorization when secret is configured
    if (cronSecret) {
      const token = authHeader?.replace('Bearer ', '') || req.headers.get('x-cron-secret');
      if (token !== cronSecret) {
        return NextResponse.json(
          createErrorResponse('UNAUTHORIZED', 'Invalid or missing cron execution secret'),
          { status: 401 }
        );
      }
    }

    const summary = await DoseService.evaluateOverdueMissedDoses();

    return NextResponse.json(
      createSuccessResponse({
        timestamp: new Date().toISOString(),
        ...summary,
        status: 'SUCCESS',
      })
    );
  } catch (err) {
    console.error('[Cron Missed Dose Check Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to evaluate overdue doses'),
      { status: 500 }
    );
  }
}
