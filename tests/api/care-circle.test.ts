import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleListMembers } from '@/app/api/v1/care-circle/route';
import { POST as handleInviteMember } from '@/app/api/v1/care-circle/invite/route';
import { POST as handleEmergencyBroadcast } from '@/app/api/v1/care-circle/emergency-broadcast/route';
import { PATCH as handleUpdateMember, DELETE as handleDeleteMember } from '@/app/api/v1/care-circle/[id]/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { CareCircleService } from '@/server/services/care-circle.service';
import { NotificationService } from '@/server/services/notification.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/care-circle.service', () => ({
  CareCircleService: {
    listMembers: vi.fn(),
    inviteMember: vi.fn(),
    updateMember: vi.fn(),
    deleteMember: vi.fn(),
  },
}));

vi.mock('@/server/services/notification.service', () => ({
  NotificationService: {
    broadcastEmergencySOS: vi.fn(),
  },
}));

describe('Care Circle API Integration (/api/v1/care-circle)', () => {
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

  describe('GET /api/v1/care-circle', () => {
    it('returns 200 with care circle members list for authorized user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(CareCircleService.listMembers).mockResolvedValue([
        { id: 'member-1', name: 'Sarah Vance', relation: 'Daughter' },
      ] as any);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle');
      const response = await handleListMembers(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle');
      const response = await handleListMembers(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/care-circle/invite', () => {
    const validInvite = {
      name: 'James Vance',
      relation: 'Son',
      role: 'family',
      phone: '(503) 555-0188',
      email: 'james@vance.family',
    };

    it('returns 201 Created on valid invitation payload', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(CareCircleService.inviteMember).mockResolvedValue({
        id: 'member-new',
        ...validInvite,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInvite),
      });

      const response = await handleInviteMember(req);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('James Vance');
    });

    it('returns 400 Bad Request on invalid email or missing fields', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'James' }),
      });

      const response = await handleInviteMember(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/care-circle/emergency-broadcast', () => {
    it('returns 202 Accepted when emergency broadcast SOS is triggered', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(NotificationService.broadcastEmergencySOS).mockResolvedValue({
        success: true,
        alertId: 'notif-sos-1',
        timestamp: '2026-11-15T18:00:00Z',
        dispatchedCount: 3,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/emergency-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'Severe shortness of breath',
          latitude: 45.5152,
          longitude: -122.6784,
        }),
      });

      const response = await handleEmergencyBroadcast(req);
      const json = await response.json();

      expect(response.status).toBe(202);
      expect(json.success).toBe(true);
      expect(json.data.alertId).toBe('notif-sos-1');
      expect(NotificationService.broadcastEmergencySOS).toHaveBeenCalledWith(
        'user-margaret-1',
        'Severe shortness of breath',
        { lat: 45.5152, lng: -122.6784 }
      );
    });

    it('returns 400 Bad Request when emergency reason is missing', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/emergency-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await handleEmergencyBroadcast(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/care-circle/[id]', () => {
    it('returns 200 with updated member permissions', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(CareCircleService.updateMember).mockResolvedValue({
        id: 'member-1',
        canManageMeds: false,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/member-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canManageMeds: false }),
      });

      const context = { params: Promise.resolve({ id: 'member-1' }) };
      const response = await handleUpdateMember(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.canManageMeds).toBe(false);
    });
  });

  describe('DELETE /api/v1/care-circle/[id]', () => {
    it('returns 200 when member is removed from care circle', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/care-circle/member-1', {
        method: 'DELETE',
      });

      const context = { params: Promise.resolve({ id: 'member-1' }) };
      const response = await handleDeleteMember(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(CareCircleService.deleteMember).toHaveBeenCalledWith('member-1');
    });
  });
});
