import { NextRequest, NextResponse } from 'next/server';
import { DoseService } from '@/server/services/dose.service';
import { createSuccessResponse, createErrorResponse } from '@/types/api';

export async function GET(req: NextRequest) {
  return handleDailyDoseCron(req);
}

export async function POST(req: NextRequest) {
  return handleDailyDoseCron(req);
}

async function handleDailyDoseCron(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const summary = await DoseService.generateDailyDosesForDate(targetDate);

    return NextResponse.json(
      createSuccessResponse({
        timestamp: new Date().toISOString(),
        targetDate: targetDate.toISOString().split('T')[0],
        ...summary,
        status: 'SUCCESS',
      })
    );
  } catch (err) {
    console.error('[Cron Daily Doses Error]', err);
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', 'Failed to generate scheduled dose records'),
      { status: 500 }
    );
  }
}
