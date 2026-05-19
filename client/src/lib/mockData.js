export const branches = [{ id: 'chennai', name: 'Chennai', address: 'KP Tower, No. 19/35, Mount Road, Little Mount, Chennai - 600015' }];

export const spaces = [
  {
    id: 'space-1',
    name: 'Virtual Office Premium',
    type: 'VIRTUAL_OFFICE',
    branchId: 'chennai',
    branchName: 'KP Tower, Chennai',
    price_per_month: 4999,
    price_per_day: 0,
    price_per_hour: 0,
    capacity: 1,
    amenities: ['Mail Handling', 'Phone Answering', 'Office Address'],
    bookedDates: [
      { start: '2026-06-10', end: '2026-06-15' },
      { start: '2026-07-01', end: '2026-07-05' },
    ],
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'],
    description: 'A premium virtual office package with business address and mail handling.',
  },
  {
    id: 'space-2',
    name: 'Coworking Hot Desk',
    type: 'COWORKING_HOT_DESK',
    branchId: 'chennai',
    branchName: 'KP Tower, Chennai',
    price_per_month: 8999,
    price_per_day: 299,
    price_per_hour: 50,
    capacity: 1,
    amenities: ['WiFi', 'Coffee', 'Meeting Room Access'],
    bookedDates: [
      { start: '2026-06-18', end: '2026-06-21' },
      { start: '2026-07-08', end: '2026-07-10' },
    ],
    images: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80'],
    description: 'Flexible hot desk seating with high-speed internet and community benefits.',
  },
  {
    id: 'space-3',
    name: 'Private Cabin Suite',
    type: 'PRIVATE_CABIN',
    branchId: 'chennai',
    branchName: 'KP Tower, Chennai',
    price_per_month: 29999,
    price_per_day: 0,
    price_per_hour: 0,
    capacity: 4,
    amenities: ['Private Space', 'AC', 'Locker'],
    bookedDates: [
      { start: '2026-06-25', end: '2026-06-30' },
      { start: '2026-07-15', end: '2026-07-18' },
    ],
    images: ['https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80'],
    description: 'Private cabin for small teams with dedicated infrastructure and privacy.',
  },
  {
    id: 'space-4',
    name: 'Meeting Room Deluxe',
    type: 'MEETING_ROOM',
    branchId: 'chennai',
    branchName: 'KP Tower, Chennai',
    price_per_month: 0,
    price_per_day: 0,
    price_per_hour: 499,
    capacity: 8,
    amenities: ['Projector', 'Conference Phone', 'Tea Service'],
    bookedDates: [
      { start: '2026-06-14', end: '2026-06-16' },
      { start: '2026-07-02', end: '2026-07-03' },
    ],
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80'],
    description: 'Well-equipped meeting rooms for client presentations and team sessions.',
  },
];

export const testimonials = [
  { name: 'Riya Sharma', title: 'Startup Founder', quote: 'The support and environment at FL Smartech Spaces helped our team grow fast.' },
  { name: 'Amit Rao', title: 'Creative Director', quote: 'The virtual office service is seamless and gives our business a great address.' },
  { name: 'Neha Patel', title: 'Consultant', quote: 'Flexible bookings and friendly staff make it easy to stay productive.' },
];

export const serviceCards = [
  { title: 'Virtual Office', description: 'Business address, mail handling, and compliance support.', icon: 'Briefcase' },
  { title: 'Coworking', description: 'Flexible workspace with community energy and modern amenities.', icon: 'Users' },
  { title: 'Meeting Rooms', description: 'Professional rooms for meetings, interviews and workshops.', icon: 'Calendar' },
];

export const amenitiesList = ['WiFi', 'AC', 'Coffee', 'Locker', 'Projector', 'Phone Answering'];
