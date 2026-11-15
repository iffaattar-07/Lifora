import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    const {
      profile,
      todaySchedule = [],
      medications = [],
      appointments = [],
      careCircle = [],
    } = context || {};

    const query = (message || '').toLowerCase();

    // Contextual Analysis
    const pendingDoses = todaySchedule.filter((d: { status: string }) => d.status === 'pending');
    const takenDoses = todaySchedule.filter((d: { status: string }) => d.status === 'taken');
    const missedDoses = todaySchedule.filter((d: { status: string }) => d.status === 'missed');
    const nextApt = appointments[0];
    const primaryContact = profile?.emergencyContact || careCircle[0];

    let reply = '';
    const suggestedActions: { label: string; action: string }[] = [];

    // Guardrail Check: Medical diagnosis or dosage tampering
    if (
      query.includes('double dose') ||
      query.includes('change dose') ||
      query.includes('skip dose') ||
      query.includes('diagnose') ||
      query.includes('stop taking')
    ) {
      reply =
        "Safety Notice: As your Lifora Care Assistant, I cannot recommend modifying your prescribed dosages, doubling up on missed doses, or making medical diagnoses. If you missed a dose or are feeling unwell, please contact your prescribing physician, Dr. Robert Hayes at (503) 555-0144, or notify your daughter Sarah Vance.";
      suggestedActions.push(
        { label: 'Call Dr. Robert Hayes', action: 'call_doctor' },
        { label: 'Alert Sarah Vance', action: 'alert_family' }
      );
      return NextResponse.json({ reply, suggestedActions });
    }

    // 1. Pending/Today's Medications Query
    if (
      query.includes('medication') ||
      query.includes('meds') ||
      query.includes('pill') ||
      query.includes('left') ||
      query.includes('today') ||
      query.includes('taken')
    ) {
      if (pendingDoses.length === 0) {
        reply = `Wonderful news, ${profile?.preferredName || 'Margaret'}! All scheduled doses for today have already been marked as taken (${takenDoses.length} completed). You have no pending medications right now.`;
      } else {
        const doseList = pendingDoses
          .map((d: { medicationName: string; dosage: string; scheduledTime: string; instructions?: string }) => 
            `• ${d.medicationName} (${d.dosage}) scheduled for ${d.scheduledTime}${d.instructions ? ` - ${d.instructions}` : ''}`
          )
          .join('\n');

        reply = `You currently have ${pendingDoses.length} dose${pendingDoses.length > 1 ? 's' : ''} remaining for today:\n\n${doseList}\n\nWould you like me to guide you through taking your next upcoming dose?`;
        suggestedActions.push({ label: 'Mark Next Dose Taken', action: 'view_meds' });
      }
    }

    // 2. Appointments Query
    else if (
      query.includes('appointment') ||
      query.includes('doctor') ||
      query.includes('visit') ||
      query.includes('clinic') ||
      query.includes('see')
    ) {
      if (nextApt) {
        const dateStr = new Date(nextApt.date).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });
        reply = `Your next clinical appointment is with ${nextApt.doctorName} (${nextApt.specialty}) on ${dateStr} at ${nextApt.time}.\n\nLocation: ${nextApt.facility} (${nextApt.address}).\nEscort Confirmed: ${nextApt.assignedEscort || 'Sarah Vance'}.\n\nPreparation note: "${nextApt.notes || 'Please bring your current medication list.'}"`;
        suggestedActions.push({ label: 'View Appointment Details', action: 'view_appointments' });
      } else {
        reply = 'You currently have no upcoming doctor appointments on your Lifora calendar.';
      }
    }

    // 3. Family / Emergency Contact Query
    else if (
      query.includes('emergency') ||
      query.includes('sarah') ||
      query.includes('david') ||
      query.includes('contact') ||
      query.includes('family') ||
      query.includes('call')
    ) {
      reply = `Your primary emergency contact is your daughter, ${primaryContact?.name || 'Sarah Vance'} (${primaryContact?.relationship || 'Daughter'}), reachable at ${primaryContact?.phone || '(503) 555-0192'}. Your son David Vance and home care specialist Elena Rostova are also active members of your care circle and receive notifications.`;
      suggestedActions.push({ label: `Call ${primaryContact?.name || 'Sarah'}`, action: 'call_primary' });
    }

    // 4. Food instructions & timing
    else if (
      query.includes('food') ||
      query.includes('eat') ||
      query.includes('stomach') ||
      query.includes('water') ||
      query.includes('instruction')
    ) {
      const foodRules = medications
        .map((m: { name: string; withFood: string; instructions: string }) => `• ${m.name}: ${m.withFood === 'with' ? 'Take WITH meals' : m.withFood === 'after' ? 'Take AFTER meals' : 'Take anytime with water'} (${m.instructions})`)
        .join('\n');
      reply = `Here are the meal instructions for your current medications:\n\n${foodRules}\n\nAlways swallow tablets with a full glass of water to ensure gentle digestion.`;
    }

    // 5. General Daily Care Summary / Default
    else {
      const summaryState = missedDoses.length > 0 
        ? `Notice: ${missedDoses.length} dose was marked missed today. Sarah Vance has been advised.`
        : `You are in great shape today with ${takenDoses.length} taken and ${pendingDoses.length} upcoming.`;

      reply = `Hello ${profile?.preferredName || 'Margaret'}! I'm your Lifora Care Assistant. ${summaryState} How can I assist you right now? You can ask me about today's medicine times, your upcoming cardiology visit, food instructions, or reaching your family circle.`;
      suggestedActions.push(
        { label: 'Check Today’s Meds', action: 'check_meds' },
        { label: 'Next Appointment', action: 'check_apt' }
      );
    }

    return NextResponse.json({ reply, suggestedActions });
  } catch (err) {
    console.error('[Lifora Assistant API]', err);
    return NextResponse.json(
      {
        reply: "I am ready to help with your care schedule. Please check your medications or let me know if you'd like to contact your family circle.",
        suggestedActions: [],
      },
      { status: 200 }
    );
  }
}
