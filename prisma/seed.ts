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
}

main();
