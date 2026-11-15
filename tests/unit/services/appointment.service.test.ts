import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentService } from '@/server/services/appointment.service';
import { prisma } from '@/lib/db';
import { NotificationService } from '@/server/services/notification.service';

vi.mock('@/lib/db', () => ({
  prisma: {
    appointment: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/server/services/notification.service', () => ({
  NotificationService: {
    createNotification: vi.fn().mockResolvedValue({ id: 'notif-1' }),
  },
}));

describe('AppointmentService', () => {
  const userId = 'user-margaret-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listAppointments', () => {
    it('returns chronologically sorted and formatted appointments', async () => {
      const mockApts = [
        {
          id: 'apt-1',
          userId,
          doctorName: 'Dr. Robert Hayes',
          specialty: 'Cardiology',
          facility: 'St. Vincent Medical Center',
          address: '9205 SW Barnes Rd',
          contactNumber: '(503) 555-0144',
          appointmentDate: new Date('2026-11-20T00:00:00.000Z'),
          appointmentTime: '10:30 AM',
          status: 'upcoming',
          notes: 'Bring current meds list',
          requiresEscort: true,
          assignedEscort: 'Sarah Vance',
        },
      ];

      vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockApts as any);

      const result = await AppointmentService.listAppointments(userId);

      expect(result).toHaveLength(1);
      expect(result[0].doctorName).toBe('Dr. Robert Hayes');
      expect(result[0].date).toBe('2026-11-20');
      expect(result[0].requiresEscort).toBe(true);
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: [{ appointmentDate: 'asc' }, { appointmentTime: 'asc' }],
      });
    });

    it('falls back to mockAppointments on database error', async () => {
      vi.mocked(prisma.appointment.findMany).mockRejectedValue(new Error('DB Timeout'));

      const result = await AppointmentService.listAppointments(userId);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('createAppointment', () => {
    const newAptInput = {
      doctorName: 'Dr. Emily Chen',
      specialty: 'Ophthalmology',
      facility: 'Eye Health Northwest',
      address: '1955 NW Northrup St',
      contactNumber: '(503) 555-0182',
      appointmentDate: '2026-12-05',
      appointmentTime: '02:00 PM',
      notes: 'Annual diabetic eye exam',
      requiresEscort: true,
      assignedEscort: 'Sarah Vance',
    };

    it('creates appointment, notifies care circle, and logs audit event', async () => {
      const createdApt = {
        id: 'apt-2',
        userId,
        ...newAptInput,
        appointmentDate: new Date(newAptInput.appointmentDate),
        status: 'upcoming',
      };
      vi.mocked(prisma.appointment.create).mockResolvedValue(createdApt as any);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({ id: 'audit-1' } as any);

      const result = await AppointmentService.createAppointment(userId, newAptInput, 'Sarah Vance');

      expect(result).toEqual(createdApt);
      expect(prisma.appointment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            doctorName: newAptInput.doctorName,
            status: 'upcoming',
            requiresEscort: true,
          }),
        })
      );
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'appointment',
          title: 'New Appointment Scheduled',
        })
      );
      expect(prisma.auditEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'appointment_scheduled',
            entityId: 'apt-2',
          }),
        })
      );
    });

    it('falls back gracefully on DB error', async () => {
      vi.mocked(prisma.appointment.create).mockRejectedValue(new Error('Write failed'));

      const fallbackResult = await AppointmentService.createAppointment(userId, newAptInput);
      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.doctorName).toBe(newAptInput.doctorName);
      expect(fallbackResult.userId).toBe(userId);
    });
  });

  describe('updateAppointment', () => {
    it('updates appointment details including date parsing', async () => {
      const updated = { id: 'apt-1', doctorName: 'Dr. Robert Hayes', appointmentTime: '11:00 AM' };
      vi.mocked(prisma.appointment.update).mockResolvedValue(updated as any);

      const result = await AppointmentService.updateAppointment('apt-1', {
        appointmentTime: '11:00 AM',
        appointmentDate: '2026-11-21',
      });

      expect(result).toEqual(updated);
      expect(prisma.appointment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'apt-1' },
          data: expect.objectContaining({
            appointmentTime: '11:00 AM',
            appointmentDate: expect.any(Date),
          }),
        })
      );
    });

    it('returns null on failure', async () => {
      vi.mocked(prisma.appointment.update).mockRejectedValue(new Error('Update failed'));

      const result = await AppointmentService.updateAppointment('apt-1', { doctorName: 'Test' });
      expect(result).toBeNull();
    });
  });

  describe('cancelAppointment', () => {
    it('sets status to cancelled, records justification, and alerts circle', async () => {
      const cancelledApt = {
        id: 'apt-1',
        userId,
        doctorName: 'Dr. Robert Hayes',
        appointmentDate: new Date('2026-11-20'),
        status: 'cancelled',
      };
      vi.mocked(prisma.appointment.update).mockResolvedValue(cancelledApt as any);

      const result = await AppointmentService.cancelAppointment('apt-1', 'Patient has mild cold');

      expect(result).toEqual(cancelledApt);
      expect(prisma.appointment.update).toHaveBeenCalledWith({
        where: { id: 'apt-1' },
        data: {
          status: 'cancelled',
          notes: '[Cancelled: Patient has mild cold]',
        },
      });
      expect(NotificationService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'appointment',
          severity: 'warning',
          title: 'Appointment Cancelled',
        })
      );
    });

    it('returns fallback success on database failure', async () => {
      vi.mocked(prisma.appointment.update).mockRejectedValue(new Error('Cancel failed'));

      const result = await AppointmentService.cancelAppointment('apt-1');
      expect(result).toEqual({ success: true });
    });
  });
});
