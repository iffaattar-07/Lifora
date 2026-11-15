import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getAuthenticatedUser, canAccessElderlyData, canManageMedications } from '@/server/security/rbac';
import { prisma } from '@/lib/db';
import { createServerSideClient } from '@/lib/supabase/server';

vi.mock('@/lib/db', () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
    careCircleMember: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSideClient: vi.fn(),
}));

describe('Security & RBAC Layer (rbac.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthenticatedUser', () => {
    it('extracts and verifies live Supabase user session with database profile', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'live-user-1', email: 'margaret@vance.com' } },
            error: null,
          }),
        },
      };
      vi.mocked(createServerSideClient).mockResolvedValue(mockSupabase as any);

      vi.mocked(prisma.profile.findUnique).mockResolvedValue({
        id: 'live-user-1',
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        role: 'elderly',
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today', {
        headers: { authorization: 'Bearer valid-jwt-token' },
      });

      const user = await getAuthenticatedUser(req);

      expect(user).toBeDefined();
      expect(user?.id).toBe('live-user-1');
      expect(user?.role).toBe('elderly');
      expect(user?.fullName).toBe('Margaret Vance');
      expect(mockSupabase.auth.getUser).toHaveBeenCalledWith('valid-jwt-token');
    });

    it('falls back to user_metadata when profile row is not present', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: {
              user: {
                id: 'live-user-2',
                email: 'sarah@vance.com',
                user_metadata: {
                  role: 'family',
                  full_name: 'Sarah Vance',
                  preferred_name: 'Sarah',
                },
              },
            },
            error: null,
          }),
        },
      };
      vi.mocked(createServerSideClient).mockResolvedValue(mockSupabase as any);
      vi.mocked(prisma.profile.findUnique).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today', {
        headers: { authorization: 'Bearer valid-jwt-token' },
      });

      const user = await getAuthenticatedUser(req);

      expect(user?.id).toBe('live-user-2');
      expect(user?.role).toBe('family');
      expect(user?.fullName).toBe('Sarah Vance');
    });

    it('returns DEMO_SARAH when x-demo-role header is family in offline demo mode', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today', {
        headers: { 'x-demo-role': 'family' },
      });

      const user = await getAuthenticatedUser(req);

      expect(user).toBeDefined();
      expect(user?.role).toBe('family');
      expect(user?.fullName).toBe('Sarah Vance');
      expect(user?.isDemo).toBe(true);
    });

    it('returns DEMO_MARGARET by default in offline demo mode', async () => {
      vi.mocked(createServerSideClient).mockResolvedValue(null as any);

      const req = new NextRequest('http://localhost:3005/api/v1/doses/today');

      const user = await getAuthenticatedUser(req);

      expect(user).toBeDefined();
      expect(user?.role).toBe('elderly');
      expect(user?.fullName).toBe('Margaret Vance');
      expect(user?.isDemo).toBe(true);
    });
  });

  describe('canAccessElderlyData', () => {
    it('grants access when user is accessing their own records', async () => {
      const user = {
        id: 'user-margaret-1',
        email: 'margaret@lifora.demo',
        role: 'elderly' as const,
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        isDemo: false,
      };

      const hasAccess = await canAccessElderlyData(user, 'user-margaret-1');
      expect(hasAccess).toBe(true);
      expect(prisma.careCircleMember.findFirst).not.toHaveBeenCalled();
    });

    it('grants access when user is a demo user', async () => {
      const demoUser = {
        id: 'demo-sarah',
        email: 'sarah@lifora.demo',
        role: 'family' as const,
        fullName: 'Sarah Vance',
        preferredName: 'Sarah',
        isDemo: true,
      };

      const hasAccess = await canAccessElderlyData(demoUser, 'user-margaret-1');
      expect(hasAccess).toBe(true);
    });

    it('grants access when user is an accepted member of the elderly care circle', async () => {
      const nonDemoCaregiver = {
        id: 'caregiver-user-1',
        email: 'nurse.sarah@care.com',
        role: 'caretaker' as const,
        fullName: 'Sarah Nurse',
        preferredName: 'Sarah',
        isDemo: false,
      };

      vi.mocked(prisma.careCircleMember.findFirst).mockResolvedValue({
        id: 'member-1',
        elderlyUserId: 'user-margaret-1',
        memberUserId: 'caregiver-user-1',
        inviteStatus: 'accepted',
      } as any);

      const hasAccess = await canAccessElderlyData(nonDemoCaregiver, 'user-margaret-1');
      expect(hasAccess).toBe(true);
      expect(prisma.careCircleMember.findFirst).toHaveBeenCalledWith({
        where: {
          elderlyUserId: 'user-margaret-1',
          memberUserId: 'caregiver-user-1',
          inviteStatus: 'accepted',
        },
      });
    });

    it('denies access when user is not a member of the care circle', async () => {
      const unauthorizedUser = {
        id: 'stranger-user',
        email: 'intruder@random.com',
        role: 'family' as const,
        fullName: 'Stranger',
        preferredName: 'Stranger',
        isDemo: false,
      };

      vi.mocked(prisma.careCircleMember.findFirst).mockResolvedValue(null);

      const hasAccess = await canAccessElderlyData(unauthorizedUser, 'user-margaret-1');
      expect(hasAccess).toBe(false);
    });
  });

  describe('canManageMedications', () => {
    it('grants medication write permission to the elderly user themselves', async () => {
      const seniorUser = {
        id: 'user-margaret-1',
        email: 'margaret@lifora.demo',
        role: 'elderly' as const,
        fullName: 'Margaret Vance',
        preferredName: 'Margaret',
        isDemo: false,
      };

      const canManage = await canManageMedications(seniorUser, 'user-margaret-1');
      expect(canManage).toBe(true);
    });

    it('grants medication write permission when caregiver has canManageMeds enabled', async () => {
      const caregiver = {
        id: 'caregiver-sarah',
        email: 'sarah@lifora.demo',
        role: 'family' as const,
        fullName: 'Sarah Vance',
        preferredName: 'Sarah',
        isDemo: false,
      };

      vi.mocked(prisma.careCircleMember.findFirst).mockResolvedValue({
        id: 'member-1',
        canManageMeds: true,
      } as any);

      const canManage = await canManageMedications(caregiver, 'user-margaret-1');
      expect(canManage).toBe(true);
      expect(prisma.careCircleMember.findFirst).toHaveBeenCalledWith({
        where: {
          elderlyUserId: 'user-margaret-1',
          memberUserId: 'caregiver-sarah',
          canManageMeds: true,
          inviteStatus: 'accepted',
        },
      });
    });

    it('denies medication write permission when caregiver has canManageMeds disabled', async () => {
      const caregiver = {
        id: 'viewer-only',
        email: 'viewer@lifora.demo',
        role: 'family' as const,
        fullName: 'Viewer',
        preferredName: 'Viewer',
        isDemo: false,
      };

      vi.mocked(prisma.careCircleMember.findFirst).mockResolvedValue(null);

      const canManage = await canManageMedications(caregiver, 'user-margaret-1');
      expect(canManage).toBe(false);
    });
  });
});
