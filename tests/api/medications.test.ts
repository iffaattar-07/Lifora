import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleListMeds, POST as handleCreateMed } from '@/app/api/v1/medications/route';
import { PATCH as handleUpdateMed, DELETE as handleDeleteMed } from '@/app/api/v1/medications/[id]/route';
import { getAuthenticatedUser, canManageMedications } from '@/server/security/rbac';
import { MedicationService } from '@/server/services/medication.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
  canManageMedications: vi.fn(),
}));

vi.mock('@/server/services/medication.service', () => ({
  MedicationService: {
    listMedications: vi.fn(),
    createMedication: vi.fn(),
    getMedicationById: vi.fn(),
    updateMedication: vi.fn(),
    deleteMedication: vi.fn(),
  },
}));

describe('Medications API Integration (/api/v1/medications)', () => {
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

  describe('GET /api/v1/medications', () => {
    it('returns 200 with list of active medications for authenticated user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(MedicationService.listMedications).mockResolvedValue([
        { id: 'med-1', name: 'Lisinopril', dosage: '10mg' },
      ] as any);

      const req = new NextRequest('http://localhost:3005/api/v1/medications?active=true');
      const response = await handleListMeds(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(MedicationService.listMedications).toHaveBeenCalledWith('user-margaret-1', true);
    });

    it('returns 401 Unauthorized when session is missing', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/medications');
      const response = await handleListMeds(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/medications', () => {
    const validMedInput = {
      name: 'Glucosamine Sulfate',
      dosage: '1500mg',
      form: 'tablet',
      purpose: 'Joint Mobility',
      frequency: 'daily',
      scheduleTimes: ['08:00 AM'],
      withFood: 'with',
    };

    it('returns 201 Created when medication is added by authorized user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(canManageMedications).mockResolvedValue(true);
      vi.mocked(MedicationService.createMedication).mockResolvedValue({
        id: 'med-new-1',
        ...validMedInput,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validMedInput),
      });

      const response = await handleCreateMed(req);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe(validMedInput.name);
    });

    it('returns 400 Bad Request on invalid medication parameters', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '' }),
      });

      const response = await handleCreateMed(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 403 Forbidden when user lacks permission to manage medications', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(canManageMedications).mockResolvedValue(false);

      const req = new NextRequest('http://localhost:3005/api/v1/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validMedInput),
      });

      const response = await handleCreateMed(req);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error.code).toBe('FORBIDDEN');
    });
  });

  describe('PATCH /api/v1/medications/[id]', () => {
    it('returns 200 with updated medication when authorized', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(MedicationService.getMedicationById).mockResolvedValue({
        id: 'med-1',
        userId: 'user-margaret-1',
      } as any);
      vi.mocked(canManageMedications).mockResolvedValue(true);
      vi.mocked(MedicationService.updateMedication).mockResolvedValue({
        id: 'med-1',
        refillCount: 50,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/medications/med-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refillCount: 50 }),
      });

      const context = { params: Promise.resolve({ id: 'med-1' }) };
      const response = await handleUpdateMed(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.refillCount).toBe(50);
    });
  });

  describe('DELETE /api/v1/medications/[id]', () => {
    it('returns 200 with deactivation confirmation when authorized', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(MedicationService.getMedicationById).mockResolvedValue({
        id: 'med-1',
        userId: 'user-margaret-1',
      } as any);
      vi.mocked(canManageMedications).mockResolvedValue(true);

      const req = new NextRequest('http://localhost:3005/api/v1/medications/med-1', {
        method: 'DELETE',
      });

      const context = { params: Promise.resolve({ id: 'med-1' }) };
      const response = await handleDeleteMed(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(MedicationService.deleteMedication).toHaveBeenCalledWith('med-1', 'user-margaret-1');
    });
  });
});
