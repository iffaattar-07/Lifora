import { prisma } from '@/lib/db';

export class AssistantService {
  /**
   * Processes a query through the Context-Aware Intelligent Care Engine with Medical Safeguards
   */
  static async processQuery(userId: string, userMessage: string) {
    const query = userMessage.toLowerCase().trim();

    // ==================================================================
    // 1. CLINICAL MEDICAL SAFEGUARD FILTER
    // ==================================================================
    const isUnsafeDosageTampering =
      query.includes('double dose') ||
      query.includes('double up') ||
      query.includes('take two') ||
      query.includes('change dose') ||
      query.includes('increase dose') ||
      query.includes('decrease dose') ||
      query.includes('adjust dosage') ||
      query.includes('change mg') ||
      query.includes('stop taking') ||
      query.includes('quit taking') ||
      query.includes('skip dose');

    const isUnsafeDiagnosisRequest =
      query.includes('diagnose') ||
      query.includes('what disease') ||
      query.includes('do i have') ||
      query.includes('is this a heart attack') ||
      query.includes('is this cancer') ||
      query.includes('what is wrong with me');

    if (isUnsafeDosageTampering || isUnsafeDiagnosisRequest) {
      return {
        reply:
          "Safety Notice: As your Lifora Care Companion, I am strictly programmed to protect your health. I cannot recommend altering your prescribed dosages, doubling up on missed doses, or making medical diagnoses.\n\nIf you missed a dose, feel unusual symptoms, or have questions about your prescription, please immediately contact your prescribing physician, Dr. Robert Hayes, MD at (503) 555-0144, or call your daughter Sarah Vance.",
        suggestedActions: [
          { label: 'Call Dr. Robert Hayes', action: 'call_doctor', payload: { phone: '(503) 555-0144' } },
          { label: 'Call Sarah Vance', action: 'call_family', payload: { phone: '(503) 555-0192' } },
        ],
        isSafeguardTriggered: true,
      };
    }

    // ==================================================================
    // 2. RETRIEVE LIVE CLINICAL CONTEXT
    // ==================================================================
    let profile = null;
    let medications: Array<{ name: string; dosage: string; withFood: string; instructions: string }> = [];
    let todayDoses: Array<{ status: string; medicationName: string; dosage: string; scheduledTime: string; instructions?: string }> = [];
    let appointments: Array<{ doctorName: string; specialty: string; facility: string; address: string; appointmentDate: Date; appointmentTime: string; assignedEscort: string | null; notes: string | null }> = [];

    try {
      profile = await prisma.profile.findUnique({ where: { id: userId } });
      const rawMeds = await prisma.medication.findMany({ where: { userId, active: true } });
      medications = rawMeds.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        withFood: m.withFood,
        instructions: m.instructions,
      }));

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const rawDoses = await prisma.doseLog.findMany({
        where: { userId, scheduledDate: today },
        include: { medication: true },
      });

      todayDoses = rawDoses.map((d) => ({
        status: d.status,
        medicationName: d.medication.name,
        dosage: d.medication.dosage,
        scheduledTime: d.scheduledTime,
        instructions: d.medication.instructions,
      }));

      appointments = await prisma.appointment.findMany({
        where: { userId, status: 'upcoming' },
        orderBy: { appointmentDate: 'asc' },
        take: 3,
      });
    } catch {
      // Fallback for offline mock data mode
      const mock = await import('@/lib/mockData');
      profile = mock.mockUserProfile;
      medications = mock.mockMedications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        withFood: m.withFood,
        instructions: m.instructions,
      }));
      todayDoses = mock.mockTodaySchedule.map((d) => ({
        status: d.status,
        medicationName: d.medicationName,
        dosage: d.dosage,
        scheduledTime: d.scheduledTime,
        instructions: d.instructions,
      }));
      appointments = mock.mockAppointments.map((a) => ({
        doctorName: a.doctorName,
        specialty: a.specialty,
        facility: a.facility,
        address: a.address,
        appointmentDate: new Date(a.date),
        appointmentTime: a.time,
        assignedEscort: a.assignedEscort || null,
        notes: a.notes || null,
      }));
    }

    const preferredName = profile?.preferredName || 'Margaret';
    const pendingDoses = todayDoses.filter((d) => d.status === 'pending');
    const takenDoses = todayDoses.filter((d) => d.status === 'taken');
    const nextApt = appointments[0];

    // ==================================================================
    // 3. CONTEXT-AWARE INTENT ROUTING
    // ==================================================================

    // Query 1: Medications left / pills schedule
    if (
      query.includes('medication') ||
      query.includes('pill') ||
      query.includes('dose') ||
      query.includes('left') ||
      query.includes('schedule') ||
      query.includes('next')
    ) {
      if (pendingDoses.length === 0) {
        return {
          reply: `Wonderful news, ${preferredName}! You have already completed all scheduled doses for today (${takenDoses.length} completed). You have no pending medications right now.`,
          suggestedActions: [
            { label: 'View All Medications', action: 'view_meds' },
            { label: 'Check Appointments', action: 'check_appointments' },
          ],
        };
      }

      const list = pendingDoses
        .map((d) => `• ${d.medicationName} (${d.dosage}) scheduled for ${d.scheduledTime}${d.instructions ? ` - ${d.instructions}` : ''}`)
        .join('\n');

      return {
        reply: `${preferredName}, you have ${pendingDoses.length} dose${pendingDoses.length > 1 ? 's' : ''} remaining for today:\n\n${list}\n\nYour immediate next dose is ${pendingDoses[0].medicationName} at ${pendingDoses[0].scheduledTime}.`,
        suggestedActions: [
          { label: 'I Took This Now', action: 'mark_next_dose_taken' },
          { label: 'Read Aloud', action: 'speak_text' },
        ],
      };
    }

    // Query 2: Appointments / Doctor visits
    if (
      query.includes('appointment') ||
      query.includes('doctor') ||
      query.includes('visit') ||
      query.includes('clinic') ||
      query.includes('dr.') ||
      query.includes('hayes')
    ) {
      if (nextApt) {
        const dateStr = new Date(nextApt.appointmentDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        return {
          reply: `Your next clinical appointment is with ${nextApt.doctorName} (${nextApt.specialty}) on ${dateStr} at ${nextApt.appointmentTime}.\n\nLocation: ${nextApt.facility} (${nextApt.address}).\nCompanion Confirmed: ${nextApt.assignedEscort || 'Sarah Vance (Daughter)'}.\n\nPreparation note: "${nextApt.notes || 'Please bring your current medication list.'}"`,
          suggestedActions: [
            { label: 'Call Clinic Reception', action: 'call_clinic' },
            { label: 'View All Appointments', action: 'view_appointments' },
          ],
        };
      }

      return {
        reply: `You currently have no upcoming doctor appointments scheduled on your Lifora calendar.`,
        suggestedActions: [{ label: 'Schedule Doctor Visit', action: 'schedule_visit' }],
      };
    }

    // Query 3: Food / Meal Instructions
    if (
      query.includes('food') ||
      query.includes('eat') ||
      query.includes('meal') ||
      query.includes('water') ||
      query.includes('stomach')
    ) {
      const foodRules = medications
        .map((m) => `• ${m.name} (${m.dosage}): ${m.withFood === 'with' ? 'Take WITH meals' : m.withFood === 'after' ? 'Take AFTER meals' : 'Take anytime with water'} (${m.instructions})`)
        .join('\n');

      return {
        reply: `Here are the meal instructions for your active prescriptions:\n\n${foodRules}\n\nAlways drink a full glass of water with your tablets to assist smooth absorption.`,
        suggestedActions: [{ label: 'Check Today’s Meds', action: 'check_meds' }],
      };
    }

    // Default Reassuring Overview
    return {
      reply: `Hello ${preferredName}! I'm your Lifora Care Companion. You have taken ${takenDoses.length} dose${takenDoses.length === 1 ? '' : 's'} today and have ${pendingDoses.length} upcoming. Your next doctor visit is on ${nextApt ? new Date(nextApt.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'schedule'}.\n\nHow can I help you right now?`,
      suggestedActions: [
        { label: 'What pills do I take next?', action: 'query_next' },
        { label: 'When is my next appointment?', action: 'query_apt' },
        { label: 'Do I take pills with food?', action: 'query_food' },
      ],
    };
  }
}
