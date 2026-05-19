import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = 'Admin@1234';
  const managerPassword = 'Manager@1234';
  const customerPassword = 'Test@1234';

  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@kptower.in' },
    update: {},
    create: {
      email: 'super@kptower.in',
      password: await bcrypt.hash(adminPassword, 10),
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      is_verified: true,
    },
  });

  const branchAdmin = await prisma.user.upsert({
    where: { email: 'manager@kptower.in' },
    update: {},
    create: {
      email: 'manager@kptower.in',
      password: await bcrypt.hash(managerPassword, 10),
      name: 'Branch Manager',
      role: 'BRANCH_ADMIN',
      is_verified: true,
    },
  });

  const customerTest = await prisma.user.upsert({
    where: { email: 'test@customer.in' },
    update: {},
    create: {
      email: 'test@customer.in',
      password: await bcrypt.hash(customerPassword, 10),
      name: 'Test Customer',
      role: 'CUSTOMER',
      is_verified: true,
    },
  });

  const branch = await prisma.branch.upsert({
    where: { id: 'seed-branch-kp-tower' },
    update: {},
    create: {
      id: 'seed-branch-kp-tower',
      name: 'KP Tower',
      address: 'No. 19/35, Mount Road, Little Mount, Chennai - 600015',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600015',
      phone: '044-12345678',
      email: 'kptower@kptower.in',
      google_maps_url: '',
    },
  });

  await prisma.branchAdmin.upsert({
    where: { id: 'seed-branch-admin-kp-tower' },
    update: {},
    create: {
      id: 'seed-branch-admin-kp-tower',
      branchId: branch.id,
      userId: branchAdmin.id,
    },
  });

  const spacesData = [
    {
      name: 'Virtual Office Basic',
      type: 'VIRTUAL_OFFICE',
      description: 'GST and ROC address use with mail handling support.',
      capacity: 1,
      area_sqft: 40,
      price_per_month: 2500,
      amenities: ['Registered Office Address', 'Mail Handling'],
      images: [],
    },
    {
      name: 'Virtual Office Premium',
      type: 'VIRTUAL_OFFICE',
      description: 'Premium virtual office with mail handling and 4 meeting room hours per month.',
      capacity: 1,
      area_sqft: 55,
      price_per_month: 5000,
      amenities: ['Mail Handling', '4 Meeting Room Hours', 'Phone Answering'],
      images: [],
    },
    {
      name: 'Hot Desk',
      type: 'COWORKING_HOT_DESK',
      description: 'Open coworking floor with flexible day or monthly plans.',
      capacity: 1,
      price_per_day: 199,
      price_per_month: 3500,
      amenities: ['Open Floor', 'WiFi', 'AC'],
      images: [],
    },
    {
      name: 'Dedicated Desk',
      type: 'DEDICATED_DESK',
      description: 'Fixed desk with locker for a focused workspace.',
      capacity: 1,
      price_per_month: 6000,
      amenities: ['Locker', 'Dedicated Workspace', 'WiFi'],
      images: [],
    },
    {
      name: 'Private Cabin',
      type: 'PRIVATE_CABIN',
      description: 'Private 2-3 person cabin with AC and secure access.',
      capacity: 3,
      price_per_month: 15000,
      amenities: ['AC', 'Privacy', 'Whiteboard'],
      images: [],
    },
    {
      name: 'Meeting Room',
      type: 'MEETING_ROOM',
      description: 'Meeting room for 8 with projector and AC.',
      capacity: 8,
      price_per_hour: 500,
      amenities: ['Projector', 'AC', 'Conference Table'],
      images: [],
    },
  ];

  const spaces = [];
  for (const [index, spaceData] of spacesData.entries()) {
    const space = await prisma.space.upsert({
      where: { id: `seed-space-${index + 1}` },
      update: {},
      create: {
        id: `seed-space-${index + 1}`,
        branchId: branch.id,
        name: spaceData.name,
        type: spaceData.type,
        description: spaceData.description,
        capacity: spaceData.capacity,
        area_sqft: spaceData.area_sqft,
        price_per_month: spaceData.price_per_month,
        price_per_day: spaceData.price_per_day,
        price_per_hour: spaceData.price_per_hour,
        amenities: spaceData.amenities,
        images: spaceData.images,
      },
    });
    spaces.push(space);
  }

  const flSmartechCustomer = await prisma.user.upsert({
    where: { email: 'faizal@kptower.in' },
    update: {},
    create: {
      email: 'faizal@kptower.in',
      password: await bcrypt.hash('Password123', 10),
      name: 'M Faizal Ahamed',
      company_name: 'FL Smartech Private Limited',
      role: 'CUSTOMER',
      is_verified: true,
    },
  });

  const startupCustomer = await prisma.user.upsert({
    where: { email: 'contact@samplestartup.co' },
    update: {},
    create: {
      email: 'contact@samplestartup.co',
      password: await bcrypt.hash('Password123', 10),
      name: 'Sample Startup Co',
      company_name: 'Sample Startup Co',
      role: 'CUSTOMER',
      is_verified: false,
    },
  });

  const freelancerCustomer = await prisma.user.upsert({
    where: { email: 'freelancer@kptower.in' },
    update: {},
    create: {
      email: 'freelancer@kptower.in',
      password: await bcrypt.hash('Password123', 10),
      name: 'Individual Freelancer',
      role: 'CUSTOMER',
      is_verified: true,
    },
  });

  const bookings = [];

  const flBooking = await prisma.booking.upsert({
    where: { booking_number: 'FLS-2026-00001' },
    update: {},
    create: {
      booking_number: 'FLS-2026-00001',
      userId: flSmartechCustomer.id,
      spaceId: spaces[1].id,
      branchId: branch.id,
      booking_type: 'VIRTUAL_OFFICE',
      plan_type: 'MONTHLY',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'ACTIVE',
      total_amount: 5000,
      paid_amount: 5000,
      balance_amount: 0,
      purpose_of_use: 'GST and ROC address use for company registration',
      company_name_for_noc: 'FL Smartech Private Limited',
      director_name: 'M Faizal Ahamed',
      director_din: 'DIN0001234',
      notes: 'Premium virtual office membership with mail handling and meeting room hours.',
    },
  });
  bookings.push(flBooking);

  const startupBooking = await prisma.booking.upsert({
    where: { booking_number: 'FLS-2026-00002' },
    update: {},
    create: {
      booking_number: 'FLS-2026-00002',
      userId: startupCustomer.id,
      spaceId: spaces[3].id,
      branchId: branch.id,
      booking_type: 'COWORKING',
      plan_type: 'MONTHLY',
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: 'PENDING',
      total_amount: 6000,
      paid_amount: 0,
      balance_amount: 6000,
      purpose_of_use: 'Monthly coworking space for startup team',
      notes: 'Dedicated desk plan, payment pending.',
    },
  });
  bookings.push(startupBooking);

  const freelancerBooking = await prisma.booking.upsert({
    where: { booking_number: 'FLS-2026-00003' },
    update: {},
    create: {
      booking_number: 'FLS-2026-00003',
      userId: freelancerCustomer.id,
      spaceId: spaces[2].id,
      branchId: branch.id,
      booking_type: 'COWORKING',
      plan_type: 'DAILY',
      start_date: new Date(),
      end_date: new Date(new Date().setDate(new Date().getDate() + 1)),
      status: 'CONFIRMED',
      total_amount: 199,
      paid_amount: 199,
      balance_amount: 0,
      purpose_of_use: 'One-day hot desk booking for a freelance project.',
      notes: 'Day booking on open coworking floor.',
    },
  });
  bookings.push(freelancerBooking);

  const testBooking = await prisma.booking.upsert({
    where: { booking_number: 'FLS-2026-00004' },
    update: {},
    create: {
      booking_number: 'FLS-2026-00004',
      userId: customerTest.id,
      spaceId: spaces[5].id,
      branchId: branch.id,
      booking_type: 'MEETING_ROOM',
      plan_type: 'HOURLY',
      start_date: new Date(),
      end_date: new Date(new Date().setHours(new Date().getHours() + 2)),
      status: 'CONFIRMED',
      total_amount: 1000,
      paid_amount: 1000,
      balance_amount: 0,
      purpose_of_use: 'Customer test booking for meeting room.',
    },
  });
  bookings.push(testBooking);

  await prisma.payment.upsert({
    where: { id: 'seed-payment-0001' },
    update: {},
    create: {
      id: 'seed-payment-0001',
      bookingId: flBooking.id,
      userId: flSmartechCustomer.id,
      amount: 5000,
      payment_mode: 'UPI',
      transaction_reference: 'TXN-FLS-0001',
      status: 'COMPLETED',
      receipt_number: 'REC-FLS-0001',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-payment-0002' },
    update: {},
    create: {
      id: 'seed-payment-0002',
      bookingId: startupBooking.id,
      userId: startupCustomer.id,
      amount: 0,
      payment_mode: 'NEFT',
      status: 'PENDING',
      receipt_number: 'REC-SS-0002',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-payment-0003' },
    update: {},
    create: {
      id: 'seed-payment-0003',
      bookingId: freelancerBooking.id,
      userId: freelancerCustomer.id,
      amount: 199,
      payment_mode: 'CARD',
      transaction_reference: 'TXN-FR-0003',
      status: 'COMPLETED',
      receipt_number: 'REC-FR-0003',
    },
  });

  await prisma.payment.upsert({
    where: { id: 'seed-payment-0004' },
    update: {},
    create: {
      id: 'seed-payment-0004',
      bookingId: testBooking.id,
      userId: customerTest.id,
      amount: 1000,
      payment_mode: 'CARD',
      transaction_reference: 'TXN-TEST-0004',
      status: 'COMPLETED',
      receipt_number: 'REC-TEST-0004',
    },
  });

  await prisma.document.upsert({
    where: { id: 'seed-doc-0001' },
    update: {},
    create: {
      id: 'seed-doc-0001',
      bookingId: flBooking.id,
      userId: flSmartechCustomer.id,
      doc_type: 'COMPANY_PAN',
      file_url: 'https://example.com/docs/fls-company-pan.pdf',
      file_name: 'FLS_COMPANY_PAN.pdf',
      verified: true,
      verifiedById: superAdmin.id,
      verified_at: new Date(),
    },
  });

  await prisma.document.upsert({
    where: { id: 'seed-doc-0002' },
    update: {},
    create: {
      id: 'seed-doc-0002',
      bookingId: flBooking.id,
      userId: flSmartechCustomer.id,
      doc_type: 'GST_CERTIFICATE',
      file_url: 'https://example.com/docs/fls-gst-certificate.pdf',
      file_name: 'FLS_GST_CERTIFICATE.pdf',
      verified: true,
      verifiedById: superAdmin.id,
      verified_at: new Date(),
    },
  });

  await prisma.document.upsert({
    where: { id: 'seed-doc-0003' },
    update: {},
    create: {
      id: 'seed-doc-0003',
      bookingId: flBooking.id,
      userId: flSmartechCustomer.id,
      doc_type: 'NOC_ISSUED',
      file_url: 'https://example.com/docs/fls-noc-issued.pdf',
      file_name: 'FLS_NOC_ISSUED.pdf',
      verified: true,
      verifiedById: superAdmin.id,
      verified_at: new Date(),
    },
  });

  await prisma.nOCRequest.upsert({
    where: { id: 'seed-noc-0001' },
    update: {},
    create: {
      id: 'seed-noc-0001',
      bookingId: flBooking.id,
      company_name: 'FL Smartech Private Limited',
      director_name: 'M Faizal Ahamed',
      director_din: 'DIN0001234',
      purpose: 'Official NOC for registered office location use',
      status: 'ISSUED',
      generated_pdf_url: 'https://example.com/noc/fls-noc-issued.pdf',
      issued_at: new Date(),
      valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
  });

  await prisma.announcement.upsert({
    where: { id: 'seed-announcement-0001' },
    update: {},
    create: {
      id: 'seed-announcement-0001',
      branchId: branch.id,
      title: 'KP Tower Launch Offer',
      body: 'Enjoy a special launch discount on virtual office and coworking plans this month.',
    },
  });

  console.log('Seeding complete.');
  console.log('Admin login: super@kptower.in / Admin@1234');
  console.log('Branch admin login: manager@kptower.in / Manager@1234');
  console.log('Customer login: test@customer.in / Test@1234');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
