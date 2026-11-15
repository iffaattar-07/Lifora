import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleTodayDoses } from '@/app/api/v1/doses/today/route';
import { POST as handleTakeDose } from '@/app/api/v1/doses/[id]/take/route';
import { POST as handleMissDose } from '@/app/api/v1/doses/[id]/miss/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { DoseService } from '@/server/services/dose.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/dose.service', () => ({
  DoseService: {
    getTodaySchedule: vi.fn(),
    markDoseTaken: vi.fn(),
    markDoseMissed: vi.fn(),
  },
}));

describe('Doses API Integration (/api/v1/doses)', () => {
  const seniorUser = {
    id: 'user-margaret-1',
    email: 'margaret@lifora.demo',
    role: 'elderly' as const,
    fullName: 'Margaret Vance',
    preferredName: 'Margaret',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/doses/today', () => {
    it('returns 200 with today schedule and adherence statistics', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(DoseService.getTodaySchedule).mockResolvedValue({
        schedule: [
          { id: 'dose-1', medicationName: 'Lisinopril', status: 'taken', scheduledTime: '08:00 AM' },
          { id: 'dose-2', medicationName: 'Metformin', status: 'pending', scheduledTime: '01:00 PM' },
        ],
        adherenceStats: {
          todayPercentage: 50,
          totalTakenToday: 1,
          totalScheduledToday: 2,
        },
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today');
      const response = await handleTodayDoses(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.schedule).toHaveLength(2);
      expect(json.data.adherenceStats.todayPercentage).toBe(50);
    });

    it('returns 401 when unauthenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today');
      const response = await handleTodayDoses(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/doses/[id]/take', () => {
    it('returns 200 with confirmed taken status', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(DoseService.markDoseTaken).mockResolvedValue({
        id: 'dose-1',
        status: 'taken',
        takenAt: new Date(),
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/dose-1/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: 'Taken with breakfast' }),
      });

      const context = { params: Promise.resolve({ id: 'dose-1' }) };
      const response = await handleTakeDose(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.dose.status).toBe('taken');
      expect(json.data.message).toContain('taken successfully');
      expect(DoseService.markDoseTaken).toHaveBeenCalledWith(
        'dose-1',
        'Margaret Vance',
        'elderly',
        undefined
      );
    });
  });

  describe('POST /api/v1/doses/[id]/miss', () => {
    it('returns 200 when missed reason is provided', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(DoseService.markDoseMissed).mockResolvedValue({
        id: 'dose-2',
        status: 'missed',
        missedReason: 'Fell asleep early',
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/dose-2/miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Fell asleep early' }),
      });

      const context = { params: Promise.resolve({ id: 'dose-2' }) };
      const response = await handleMissDose(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.dose.status).toBe('missed');
      expect(DoseService.markDoseMissed).toHaveBeenCalledWith(
        'dose-2',
        'Margaret Vance',
        'elderly',
        'Fell asleep early'
      );
    });

    it('returns 400 Bad Request when missed reason is omitted', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/dose-2/miss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const context = { params: Promise.resolve({ id: 'dose-2' }) };
      const response = await handleMissDose(req, context);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
