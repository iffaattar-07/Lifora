import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Deterministic UUIDs for interactive demo reproducibility
const MARGARET_ID = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
const SARAH_ID = 'b2c3d4e5-f6a1-4b2c-9d3e-4f5a6b7c8d9e';
const DAVID_ID = 'c3d4e5f6-a1b2-4c3d-ae4f-5a6b7c8d9e0f';
const ELENA_ID = 'd4e5f6a1-b2c3-4d4e-bf5a-6b7c8d9e0f1a';

async function main() {
  console.log('🌱 Seeding Lifora database with rich clinical demo dataset...');

  // 1. Upsert Margaret Vance (Care Recipient)
  const margaret = await prisma.profile.upsert({
    where: { id: MARGARET_ID },
    update: { email: 'margaret.vance@example.com' },
    create: {
      id: MARGARET_ID,
      email: 'margaret.vance@example.com',
      role: 'elderly',
      fullName: 'Margaret Vance',
      preferredName: 'Margaret',
      age: 78,
      dob: new Date('1948-04-12'),
      bloodType: 'O+',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
      phone: '(503) 555-0118',
      address: '428 Whispering Oaks Lane, Apt 3B, Portland, OR',
      timezone: 'America/Los_Angeles',
      primaryConditions: ['Hypertension', 'Type 2 Diabetes (Managed)', 'Mild Osteoarthritis'],
      knownAllergies: ['Penicillin', 'Sulfa drugs'],
      emergencyContact: {
        name: 'Sarah Vance',
        relationship: 'Daughter',
        phone: '(503) 555-0192',
      },
      primaryPhysician: {
        name: 'Dr. Robert Hayes, MD',
        clinic: 'St. Jude Geriatric Health Center',
        phone: '(503) 555-0144',
      },
    },
  });

  // 2. Upsert Sarah Vance (Family Admin / Daughter)
  const sarah = await prisma.profile.upsert({
    where: { id: SARAH_ID },
    update: { email: 'sarah.vance@example.com' },
    create: {
      id: SARAH_ID,
      email: 'sarah.vance@example.com',
      role: 'family',
      fullName: 'Sarah Vance',
      preferredName: 'Sarah',
      age: 46,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      phone: '(503) 555-0192',
      address: '1420 NW 23rd Ave, Portland, OR',
      timezone: 'America/Los_Angeles',
      primaryConditions: [],
      knownAllergies: [],
    },
  });

  // 3. Upsert Care Circle Connections
  await prisma.careCircleMember.upsert({
    where: {
      elderlyUserId_email: {
        elderlyUserId: MARGARET_ID,
        email: 'sarah.vance@example.com',
      },
    },
    update: {},
    create: {
      elderlyUserId: MARGARET_ID,
      memberUserId: SARAH_ID,
      name: 'Sarah Vance',
      relation: 'Daughter',
      role: 'family',
      phone: '(503) 555-0192',
      email: 'sarah.vance@example.com',
      isEmergencyContact: true,
      canManageMeds: true,
      receiveInstantAlerts: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      inviteStatus: 'accepted',
    },
  });

  await prisma.careCircleMember.upsert({
    where: {
      elderlyUserId_email: {
        elderlyUserId: MARGARET_ID,
        email: 'david.vance@example.com',
      },
    },
    update: {},
    create: {
      elderlyUserId: MARGARET_ID,
      memberUserId: DAVID_ID,
      name: 'David Vance',
      relation: 'Son',
      role: 'family',
      phone: '(503) 555-0163',
      email: 'david.vance@example.com',
      isEmergencyContact: false,
      canManageMeds: true,
      receiveInstantAlerts: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
      inviteStatus: 'accepted',
    },
  });

  await prisma.careCircleMember.upsert({
    where: {
      elderlyUserId_email: {
        elderlyUserId: MARGARET_ID,
        email: 'elena.rostova@eldercare-nw.org',
      },
    },
    update: {},
    create: {
      elderlyUserId: MARGARET_ID,
      memberUserId: ELENA_ID,
      name: 'Elena Rostova, RN',
      relation: 'Home Nurse',
      role: 'caretaker',
      phone: '(503) 555-0188',
      email: 'elena.rostova@eldercare-nw.org',
      isEmergencyContact: false,
      canManageMeds: true,
      receiveInstantAlerts: true,
      avatarUrl: 'https://images.unsplash.com/photo-1594824813633-890204735c05?auto=format&fit=crop&q=80&w=256',
      inviteStatus: 'accepted',
    },
  });

  // 4. Upsert Active Medications
  const medLisinopril = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: MARGARET_ID,
      name: 'Lisinopril',
      genericName: 'Prinivil / Zestril',
      dosage: '10 mg',
      form: 'tablet',
      color: '#3B82F6',
      purpose: 'Blood Pressure Management',
      frequency: 'daily',
      scheduleTimes: ['08:00 AM'],
      withFood: 'with',
      instructions: 'Take 1 tablet every morning with breakfast and full glass of water.',
      prescribingDoctor: 'Dr. Robert Hayes',
      refillCount: 6,
      totalQuantity: 30,
      active: true,
      startDate: new Date('2024-01-15'),
    },
  });

  const medMetformin = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      userId: MARGARET_ID,
      name: 'Metformin HCl',
      genericName: 'Glucophage',
      dosage: '500 mg',
      form: 'tablet',
      color: '#10B981',
      purpose: 'Blood Glucose Regulation',
      frequency: 'twice_daily',
      scheduleTimes: ['08:00 AM', '07:30 PM'],
      withFood: 'with',
      instructions: 'Take with meals to prevent gastrointestinal upset.',
      prescribingDoctor: 'Dr. Anita Lin',
      refillCount: 14,
      totalQuantity: 60,
      active: true,
      startDate: new Date('2023-11-01'),
    },
  });

  const medGlucosamine = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      userId: MARGARET_ID,
      name: 'Glucosamine Sulfate',
      genericName: 'Joint Support Complex',
      dosage: '750 mg',
      form: 'capsule',
      color: '#F59E0B',
      purpose: 'Joint & Cartilage Support',
      frequency: 'daily',
      scheduleTimes: ['01:00 PM'],
      withFood: 'after',
      instructions: 'Take after midday lunch with water.',
      prescribingDoctor: 'Dr. Robert Hayes',
      refillCount: 22,
      totalQuantity: 60,
      active: true,
      startDate: new Date('2024-03-10'),
    },
  });

  const medAtorvastatin = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000004',
      userId: MARGARET_ID,
      name: 'Atorvastatin Calcium',
      genericName: 'Lipitor',
      dosage: '20 mg',
      form: 'tablet',
      color: '#8B5CF6',
      purpose: 'Cholesterol & Heart Health',
      frequency: 'daily',
      scheduleTimes: ['08:30 PM'],
      withFood: 'anytime',
      instructions: 'Take in the evening before bedtime.',
      prescribingDoctor: 'Dr. Robert Hayes',
      refillCount: 18,
      totalQuantity: 30,
      active: true,
      startDate: new Date('2024-02-01'),
    },
  });

  const medVitaminD = await prisma.medication.upsert({
    where: { id: '00000000-0000-0000-0000-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000005',
      userId: MARGARET_ID,
      name: 'Vitamin D3 & Calcium',
      genericName: 'Cholecalciferol',
      dosage: '1000 IU',
      form: 'capsule',
      color: '#EC4899',
      purpose: 'Bone Density Maintenance',
      frequency: 'daily',
      scheduleTimes: ['08:00 AM'],
      withFood: 'with',
      instructions: 'Take together with morning meal.',
      prescribingDoctor: 'Dr. Anita Lin',
      refillCount: 28,
      totalQuantity: 90,
      active: true,
      startDate: new Date('2023-09-01'),
    },
  });

  // 5. Upsert Today's Doses (Mixed Taken & Pending)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Taken morning doses
  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medLisinopril.id,
        scheduledDate: today,
        scheduledTime: '08:00 AM',
      },
    },
    update: {},
    create: {
      medicationId: medLisinopril.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '08:00 AM',
      status: 'taken',
      takenAt: new Date(today.getTime() + 8 * 3600 * 1000 + 14 * 60 * 1000), // 8:14 AM
      recordedBy: 'Margaret Vance (Self)',
    },
  });

  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medMetformin.id,
        scheduledDate: today,
        scheduledTime: '08:00 AM',
      },
    },
    update: {},
    create: {
      medicationId: medMetformin.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '08:00 AM',
      status: 'taken',
      takenAt: new Date(today.getTime() + 8 * 3600 * 1000 + 15 * 60 * 1000), // 8:15 AM
      recordedBy: 'Margaret Vance (Self)',
    },
  });

  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medVitaminD.id,
        scheduledDate: today,
        scheduledTime: '08:00 AM',
      },
    },
    update: {},
    create: {
      medicationId: medVitaminD.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '08:00 AM',
      status: 'taken',
      takenAt: new Date(today.getTime() + 8 * 3600 * 1000 + 15 * 60 * 1000),
      recordedBy: 'Margaret Vance (Self)',
    },
  });

  // Pending midday dose
  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medGlucosamine.id,
        scheduledDate: today,
        scheduledTime: '01:00 PM',
      },
    },
    update: {},
    create: {
      medicationId: medGlucosamine.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '01:00 PM',
      status: 'pending',
    },
  });

  // Pending evening doses
  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medMetformin.id,
        scheduledDate: today,
        scheduledTime: '07:30 PM',
      },
    },
    update: {},
    create: {
      medicationId: medMetformin.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '07:30 PM',
      status: 'pending',
    },
  });

  await prisma.doseLog.upsert({
    where: {
      medicationId_scheduledDate_scheduledTime: {
        medicationId: medAtorvastatin.id,
        scheduledDate: today,
        scheduledTime: '08:30 PM',
      },
    },
    update: {},
    create: {
      medicationId: medAtorvastatin.id,
      userId: MARGARET_ID,
      scheduledDate: today,
      scheduledTime: '08:30 PM',
      status: 'pending',
    },
  });

  // 6. Upsert Upcoming Clinical Appointments
  const aptDate1 = new Date();
  aptDate1.setDate(aptDate1.getDate() + 4); // in 4 days

  await prisma.appointment.upsert({
    where: { id: '00000000-0000-0000-0000-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000010',
      userId: MARGARET_ID,
      doctorName: 'Dr. Robert Hayes, MD',
      specialty: 'Geriatric Cardiology',
      facility: 'St. Jude Health & Wellness Pavilion',
      address: '1100 NW Medical Dr, Suite 304, Portland, OR',
      appointmentDate: aptDate1,
      appointmentTime: '10:30 AM',
      notes: 'Routine 6-month blood pressure review. Bring current medication organizer. Fasting not required.',
      contactNumber: '(503) 555-0144',
      requiresEscort: true,
      assignedEscort: 'Sarah Vance (Daughter)',
      status: 'upcoming',
    },
  });

  // 7. Upsert Notifications
  await prisma.careNotification.createMany({
    data: [
      {
        userId: MARGARET_ID,
        type: 'medication_reminder',
        severity: 'info',
        title: 'Upcoming Midday Dose',
        message: 'Glucosamine Sulfate 750mg is scheduled for 1:00 PM after lunch.',
        isRead: false,
        actionUrl: '/medications',
        actionLabel: 'View Dose',
      },
      {
        userId: MARGARET_ID,
        type: 'circle_update',
        severity: 'success',
        title: 'Morning Meds Confirmed',
        message: 'Sarah saw Margaret confirmed all 3 morning medications at 8:15 AM.',
        isRead: true,
      },
      {
        userId: MARGARET_ID,
        type: 'medication_reminder',
        severity: 'warning',
        title: 'Lisinopril Refill Notice',
        message: 'Only 6 days of Lisinopril 10mg remain. St. Jude Pharmacy auto-fill triggered.',
        isRead: false,
        actionUrl: '/medications',
        actionLabel: 'Check Refill',
      },
    ],
    skipDuplicates: true,
  });

  // 8. Upsert Audit Events
  await prisma.auditEvent.createMany({
    data: [
      {
        userId: MARGARET_ID,
        actorId: MARGARET_ID,
        actorName: 'Margaret Vance',
        actorRole: 'elderly',
        action: 'dose_taken',
        entityType: 'dose_log',
        metadata: { medication: 'Lisinopril', dosage: '10 mg', time: '08:14 AM' },
      },
      {
        userId: MARGARET_ID,
        actorId: SARAH_ID,
        actorName: 'Sarah Vance',
        actorRole: 'family',
        action: 'appointment_escort',
        entityType: 'appointment',
        metadata: { escort: 'Sarah Vance', doctor: 'Dr. Robert Hayes' },
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Lifora database seeded successfully with Margaret & Sarah Vance demo data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
