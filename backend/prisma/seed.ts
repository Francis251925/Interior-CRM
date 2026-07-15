import { PrismaClient, Role, LeadSource, PropertyType, LeadStatus, DealStage } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@uniqueframe.com' },
    update: {},
    create: {
      employeeName: 'Aditi Rao',
      email: 'admin@uniqueframe.com',
      mobile: '9000000001',
      role: Role.ADMIN,
      passwordHash: password,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@uniqueframe.com' },
    update: {},
    create: {
      employeeName: 'Karan Mehta',
      email: 'manager@uniqueframe.com',
      mobile: '9000000002',
      role: Role.SALES_MANAGER,
      passwordHash: password,
    },
  });

  const exec1 = await prisma.user.upsert({
    where: { email: 'exec1@uniqueframe.com' },
    update: {},
    create: {
      employeeName: 'Priya Sharma',
      email: 'exec1@uniqueframe.com',
      mobile: '9000000003',
      role: Role.SALES_EXECUTIVE,
      passwordHash: password,
    },
  });

  const exec2 = await prisma.user.upsert({
    where: { email: 'exec2@uniqueframe.com' },
    update: {},
    create: {
      employeeName: 'Rohan Iyer',
      email: 'exec2@uniqueframe.com',
      mobile: '9000000004',
      role: Role.SALES_EXECUTIVE,
      passwordHash: password,
    },
  });

  const leadsData = [
    {
      customerName: 'Ananya Gupta',
      mobile: '9812300001',
      email: 'ananya@example.com',
      location: 'Hyderabad',
      propertyType: PropertyType.APARTMENT,
      propertySize: 1450,
      budget: 1200000,
      source: LeadSource.WEBSITE,
      status: LeadStatus.NEW,
      assignedToId: exec1.id,
      notes: 'Wants a modern minimalist theme for a 3BHK.',
    },
    {
      customerName: 'Vikram Singh',
      mobile: '9812300002',
      email: 'vikram@example.com',
      location: 'Gachibowli',
      propertyType: PropertyType.VILLA,
      propertySize: 3200,
      budget: 3500000,
      source: LeadSource.REFERRAL,
      status: LeadStatus.SITE_VISIT_PLANNED,
      assignedToId: exec1.id,
      notes: 'Referred by an existing client; site visit scheduled next week.',
    },
    {
      customerName: 'Meera Nair',
      mobile: '9812300003',
      email: 'meera@example.com',
      location: 'Kondapur',
      propertyType: PropertyType.OFFICE,
      budget: 900000,
      source: LeadSource.SOCIAL_MEDIA,
      status: LeadStatus.QUOTATION_SENT,
      assignedToId: exec2.id,
      notes: 'Corporate office fit-out for a 20-seat startup.',
    },
    {
      customerName: 'Suresh Kumar',
      mobile: '9812300004',
      location: 'Banjara Hills',
      propertyType: PropertyType.HOUSE,
      budget: 2200000,
      source: LeadSource.WALK_IN,
      status: LeadStatus.WON,
      assignedToId: exec2.id,
      notes: 'Confirmed after final quotation revision.',
    },
    {
      customerName: 'Farhan Ali',
      mobile: '9812300005',
      location: 'Madhapur',
      propertyType: PropertyType.COMMERCIAL,
      budget: 500000,
      source: LeadSource.ADVERTISEMENT,
      status: LeadStatus.LOST,
      assignedToId: exec1.id,
      notes: 'Chose a competitor due to timeline constraints.',
    },
  ];

  for (let i = 0; i < leadsData.length; i++) {
    const l = leadsData[i];
    const leadNumber = `LD-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
    const existing = await prisma.lead.findUnique({ where: { mobile: l.mobile } });
    if (!existing) {
      await prisma.lead.create({
        data: { ...l, leadNumber } as any,
      });
    }
  }

  const wonLead = await prisma.lead.findUnique({ where: { mobile: '9812300004' } });
  if (wonLead) {
    const existingDeal = await prisma.deal.findUnique({ where: { leadId: wonLead.id } });
    if (!existingDeal) {
      await prisma.deal.create({
        data: {
          dealNumber: `DL-${new Date().getFullYear()}-0001`,
          leadId: wonLead.id,
          customerName: wonLead.customerName,
          propertyType: wonLead.propertyType,
          estimatedBudget: 2200000,
          expectedClosureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          probability: 80,
          stage: DealStage.NEGOTIATION,
          assignedToId: wonLead.assignedToId,
          remarks: 'Awaiting final sign-off on material selection.',
        },
      });
    }
  }

  console.log('Seed data created successfully.');
  console.log('---------------------------------');
  console.log('Admin login:   admin@uniqueframe.com / Password@123');
  console.log('Manager login: manager@uniqueframe.com / Password@123');
  console.log('Exec 1 login:  exec1@uniqueframe.com / Password@123');
  console.log('Exec 2 login:  exec2@uniqueframe.com / Password@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
