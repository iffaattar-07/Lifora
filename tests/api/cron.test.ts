import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleDailyDosesGet, POST as handleDailyDosesPost } from '@/app/api/cron/daily-doses/route';
import { GET as handleMissedCheckGet, POST as handleMissedCheckPost } from '@/app/api/cron/missed-dose-check/route';
import { DoseService } from '@/server/services/dose.service';

vi.mock('@/server/services/dose.service', () => ({
  DoseService: {
    generateDailyDosesForDate: vi.fn(),
    evaluateOverdueMissedDoses: vi.fn(),
  },
}));

describe('Cron Security & Execution API Integration (/api/cron/*)', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = 'test-super-secret-cron-token-123';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalEnv;
  });

  describe('/api/cron/daily-doses', () => {
    it('authorizes execution via Bearer token and triggers daily dose generation', async () => {
      vi.mocked(DoseService.generateDailyDosesForDate).mockResolvedValue({
        generatedCount: 4,
        activeMedicationCount: 3,
      });

      const req = new NextRequest('http://localhost:3005/api/cron/daily-doses', {
        headers: { authorization: 'Bearer test-super-secret-cron-token-123' },
      });

      const response = await handleDailyDosesGet(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.status).toBe('SUCCESS');
      expect(json.data.generatedCount).toBe(4);
      expect(DoseService.generateDailyDosesForDate).toHaveBeenCalled();
    });

    it('authorizes execution via x-cron-secret header', async () => {
      vi.mocked(DoseService.generateDailyDosesForDate).mockResolvedValue({
        generatedCount: 2,
        activeMedicationCount: 2,
      });

      const req = new NextRequest('http://localhost:3005/api/cron/daily-doses', {
        method: 'POST',
        headers: { 'x-cron-secret': 'test-super-secret-cron-token-123' },
      });

      const response = await handleDailyDosesPost(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('rejects unauthorized invocation with 401 when token is missing or invalid', async () => {
      const req = new NextRequest('http://localhost:3005/api/cron/daily-doses', {
        headers: { authorization: 'Bearer wrong-secret' },
      });

      const response = await handleDailyDosesGet(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
      expect(DoseService.generateDailyDosesForDate).not.toHaveBeenCalled();
    });
  });

  describe('/api/cron/missed-dose-check', () => {
    it('authorizes watchdog check and returns evaluation metrics', async () => {
      vi.mocked(DoseService.evaluateOverdueMissedDoses).mockResolvedValue({
        evaluatedCount: 5,
        escalatedCount: 0,
      });

      const req = new NextRequest('http://localhost:3005/api/cron/missed-dose-check', {
        headers: { authorization: 'Bearer test-super-secret-cron-token-123' },
      });

      const response = await handleMissedCheckGet(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.evaluatedCount).toBe(5);
    });

    it('rejects unauthenticated requests without secret', async () => {
      const req = new NextRequest('http://localhost:3005/api/cron/missed-dose-check');

      const response = await handleMissedCheckPost(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
      expect(DoseService.evaluateOverdueMissedDoses).not.toHaveBeenCalled();
    });
  });
});
