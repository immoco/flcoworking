import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create Super Admin
  const hashed = await bcrypt.hash('SuperSecret123!', 10);
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@flsmartech.com' },
    update: {},
    create: {
      email: 'admin@flsmartech.com',
      password: hashed,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      is_verified: true,
    },
  });

  // Create Branch
  const branch = await prisma.branch.upsert({
    where: { name: 'KP Tower' },
    update: {},
    create: {
      name: 'KP Tower',
      address: 'No. 19/35, Mount Road, Little Mount, Chennai - 600015',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600015',
      phone: '044-12345678',
      email: 'kptower@flsmartech.com',
      google_maps_url: '',
    },
  });

  // Create 5 spaces
  const spacesData = [
    {
      name: 'Virtual Office - Chennai',
      type: 'VIRTUAL_OFFICE',
      description: 'Registered office address and mail handling.',
      capacity: 1,
      area_sqft: 50,
      price_per_month: 4999,
      amenities: JSON.stringify(['Mail Handling', 'Phone Answering']),
      images: JSON.stringify([]),
    },
    {
      name: 'Hot Desk - Open Area',
      type: 'COWORKING_HOT_DESK',
      description: 'Flexible hot desk in open coworking area.',
      capacity: 1,
      price_per_day: 299,
      price_per_hour: 50,
      amenities: JSON.stringify(['WiFi', 'AC', 'Coffee']),
    },
    {
      name: 'Dedicated Desk',
      type: 'DEDICATED_DESK',
      description: 'Personal desk with 24/7 access.',
      capacity: 1,
      price_per_month: 8999,
      amenities: JSON.stringify(['Locker', 'High Speed Internet']),
    },
    {
      name: 'Private Cabin',
      type: 'PRIVATE_CABIN',
      description: 'Private cabin for small team.',
      capacity: 4,
      price_per_month: 29999,
      amenities: JSON.stringify(['AC', 'Whiteboard']),
    },
    {
      name: 'Meeting Room - Small',
      type: 'MEETING_ROOM',
      description: 'Meeting room for up to 6 people.',
      capacity: 6,
      price_per_hour: 499,
      amenities: JSON.stringify(['Projector', 'Conference Phone']),
    },
  ];

  const spaces = [];
  for (const s of spacesData) {
    const sp = await prisma.space.create({
      data: {
        branchId: branch.id,
        name: s.name,
        type: s.type,
        description: s.description,
        capacity: s.capacity,
        area_sqft: s.area_sqft,
        price_per_month: s.price_per_month,
        price_per_day: s.price_per_day,
        price_per_hour: s.price_per_hour,
        amenities: s.amenities ? JSON.parse(s.amenities) : null,
        images: s.images ? JSON.parse(s.images) : null,
      },
    });
    spaces.push(sp);
  }

  // Create 3 customers
  const customers = [];
  for (let i = 1; i <= 3; i++) {
    const c = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        password: await bcrypt.hash('Password123', 10),
        name: `Customer ${i}`,
        role: 'CUSTOMER',
        is_verified: i === 1,
      },
    });
    customers.push(c);
  }

  // Create bookings for customers
  let bookingSeq = 1;
  const bookings = [];
  for (let i = 0; i < customers.length; i++) {
    const bnum = `FLS-2026-${String(bookingSeq).padStart(5, '0')}`;
    bookingSeq++;
    const booking = await prisma.booking.create({
      data: {
        booking_number: bnum,
        userId: customers[i].id,
        spaceId: spaces[i].id,
        branchId: branch.id,
        booking_type: i === 2 ? 'MEETING_ROOM' : 'COWORKING',
        plan_type: i === 0 ? 'MONTHLY' : i === 1 ? 'DAILY' : 'HOURLY',
        start_date: new Date(),
        end_date: i === 0 ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : null,
        status: i === 0 ? 'CONFIRMED' : i === 1 ? 'PENDING' : 'ACTIVE',
        total_amount: i === 0 ? 8999 : i === 1 ? 299 : 499,
        paid_amount: i === 0 ? 8999 : i === 1 ? 0 : 200,
        balance_amount: i === 0 ? 0 : i === 1 ? 299 : 299,
        purpose_of_use: 'Business operations',
      },
    });
    bookings.push(booking);
  }

  // Sample payments
  for (const b of bookings) {
    await prisma.payment.create({
      data: {
        bookingId: b.id,
        userId: b.userId,
        amount: b.paid_amount || 0,
        payment_mode: b.paid_amount && b.paid_amount > 0 ? 'UPI' : 'NEFT',
        transaction_reference: `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        status: b.paid_amount && b.paid_amount > 0 ? 'COMPLETED' : 'PENDING',
        receipt_number: `R-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      },
    });
  }

  // Sample announcement
  await prisma.announcement.create({
    data: {
      branchId: branch.id,
      title: 'Welcome to KP Tower',
      body: 'We are happy to welcome you to our new branch at KP Tower.',
    },
  });

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
