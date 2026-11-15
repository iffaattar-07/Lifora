import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as handleListApts, POST as handleCreateApt } from '@/app/api/v1/appointments/route';
import { PATCH as handleUpdateApt, DELETE as handleDeleteApt } from '@/app/api/v1/appointments/[id]/route';
import { getAuthenticatedUser } from '@/server/security/rbac';
import { AppointmentService } from '@/server/services/appointment.service';

vi.mock('@/server/security/rbac', () => ({
  getAuthenticatedUser: vi.fn(),
}));

vi.mock('@/server/services/appointment.service', () => ({
  AppointmentService: {
    listAppointments: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
    cancelAppointment: vi.fn(),
  },
}));

describe('Appointments API Integration (/api/v1/appointments)', () => {
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

  describe('GET /api/v1/appointments', () => {
    it('returns 200 with list of appointments for authorized user', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(AppointmentService.listAppointments).mockResolvedValue([
        { id: 'apt-1', doctorName: 'Dr. Robert Hayes', date: '2026-11-20', time: '10:30 AM' },
      ] as any);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments');
      const response = await handleListApts(req);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
    });

    it('returns 401 Unauthorized when unauthenticated', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(null);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments');
      const response = await handleListApts(req);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/v1/appointments', () => {
    const validApt = {
      doctorName: 'Dr. Sarah Lin',
      specialty: 'Neurology',
      facility: 'OHSU Brain Institute',
      appointmentDate: '2026-12-01',
      appointmentTime: '11:00 AM',
    };

    it('returns 201 Created when new appointment is scheduled', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(AppointmentService.createAppointment).mockResolvedValue({
        id: 'apt-new',
        ...validApt,
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validApt),
      });

      const response = await handleCreateApt(req);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.doctorName).toBe('Dr. Sarah Lin');
    });

    it('returns 400 Bad Request on invalid parameters', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorName: 'Dr. Lin' }), // Missing required date/time/specialty
      });

      const response = await handleCreateApt(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/v1/appointments/[id]', () => {
    it('returns 200 with updated appointment', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(AppointmentService.updateAppointment).mockResolvedValue({
        id: 'apt-1',
        appointmentTime: '01:30 PM',
      } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments/apt-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentTime: '01:30 PM' }),
      });

      const context = { params: Promise.resolve({ id: 'apt-1' }) };
      const response = await handleUpdateApt(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.appointmentTime).toBe('01:30 PM');
    });
  });

  describe('DELETE /api/v1/appointments/[id]', () => {
    it('returns 200 when appointment is cancelled', async () => {
      vi.mocked(getAuthenticatedUser).mockResolvedValue(seniorUser);
      vi.mocked(AppointmentService.cancelAppointment).mockResolvedValue({ success: true } as any);

      const req = new NextRequest('http://localhost:3005/api/v1/appointments/apt-1?reason=Doctor+rescheduled', {
        method: 'DELETE',
      });

      const context = { params: Promise.resolve({ id: 'apt-1' }) };
      const response = await handleDeleteApt(req, context);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(AppointmentService.cancelAppointment).toHaveBeenCalledWith('apt-1', 'Doctor rescheduled');
    });
  });
});
