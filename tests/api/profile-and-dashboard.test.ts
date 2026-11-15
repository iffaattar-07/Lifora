import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleGetProfile, PUT as handlePutProfile } from '@/app/api/v1/profile/route';
import { GET as handleGetDashboard } from '@/app/api/v1/dashboard/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { ProfileService } from '@/server/services/profile.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/profile.service', () => ({
  ProfileService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    getDashboard: vi.fn(),
  },
}));

describe('Profile and Aggregated Dashboard API (/api/v1/profile & /api/v1/dashboard)', () => {
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

  describe('GET /api/v1/profile', () => {
    it('returns 200 with user profile for authenticated user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.getProfile).mockResolvedValue({
        id: 'user-margaret-1',
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        age: 78,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/profile');
      const response = await handleGetProfile(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Margaret Vance');
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/profile');
      const response = await handleGetProfile(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PUT /api/v1/profile', () => {
    it('returns 200 with updated profile on valid payload', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.updateProfile).mockResolvedValue({
        id: 'user-margaret-1',
        fullName: 'Margaret Vance Updated',
        age: 79,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Margaret Vance Updated', age: 79 }),
      });

      const response = await handlePutProfile(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe('Margaret Vance Updated');
    });

    it('returns 400 Bad Request on invalid age or parameters', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: 250 }), // Out of human bounds (> 130)
      });

      const response = await handlePutProfile(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/dashboard', () => {
    it('returns 200 with full aggregated clinical state for rapid dashboard rendering', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(ProfileService.getDashboard).mockResolvedValue({
        profile: { fullName: 'Margaret Vance' },
        todaySchedule: [{ id: 'dose-1' }],
        adherenceStats: { todayPercentage: 100 },
        medications: [{ id: 'med-1' }],
        appointments: [{ id: 'apt-1' }],
        careCircle: [{ id: 'member-1' }],
        notifications: [],
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/dashboard');
      const response = await handleGetDashboard(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.todaySchedule).toHaveLength(1);
      expect(json.data.adherenceStats.todayPercentage).toBe(100);
    });
  });
});
