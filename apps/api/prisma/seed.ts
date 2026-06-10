/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const imagePool = [
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
  'https://images.unsplash.com/photo-1542314831-0680e6eebb0f?w=800',
  'https://images.unsplash.com/photo-1449156493391-d2cfa28e468b?w=800',
  'https://images.unsplash.com/photo-1502005229766-52835283e22d?w=800',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
  'https://images.unsplash.com/photo-1613490497141-28a7077cd465?w=800',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800',
  'https://images.unsplash.com/photo-1598928506311-c55e1f0b1dd2?w=800',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
  'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=800',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
];

async function main() {
  console.log('🌱 Starting seed...');

  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.salesReport.deleteMany();
  await prisma.seasonalRate.deleteMany();
  await prisma.roomAvailability.deleteMany();
  await prisma.room.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.propertyCategory.deleteMany();
  await prisma.authToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  const passwordHash = await bcrypt.hash('password123', 10);

  const [user1, user2, tenant1, tenant2] = await Promise.all([
    prisma.user.create({ data: { email: 'user1@example.com', passwordHash, fullName: 'John Doe', photoUrl: 'https://i.pravatar.cc/150?img=1', role: 'USER', isVerified: true } }),
    prisma.user.create({ data: { email: 'user2@example.com', passwordHash, fullName: 'Jane Smith', photoUrl: 'https://i.pravatar.cc/150?img=2', role: 'USER', isVerified: true } }),
    prisma.user.create({ data: { email: 'tenant1@example.com', passwordHash, fullName: 'Tenant One', photoUrl: 'https://i.pravatar.cc/150?img=3', role: 'TENANT', isVerified: true } }),
    prisma.user.create({ data: { email: 'tenant2@example.com', passwordHash, fullName: 'Tenant Two', photoUrl: 'https://i.pravatar.cc/150?img=4', role: 'TENANT', isVerified: true } }),
  ]);

  console.log('👤 Created 4 users');

  const categories = await Promise.all([
    prisma.propertyCategory.create({ data: { name: 'Apartemen' } }),
    prisma.propertyCategory.create({ data: { name: 'Villa' } }),
    prisma.propertyCategory.create({ data: { name: 'Hotel' } }),
    prisma.propertyCategory.create({ data: { name: 'Resort' } }),
    prisma.propertyCategory.create({ data: { name: 'Guesthouse' } }),
    prisma.propertyCategory.create({ data: { name: 'Cabin' } }),
    prisma.propertyCategory.create({ data: { name: 'Studio' } }),
  ]);

  console.log('🏷️ Created 7 property categories');

  const propertiesData = [
    { name: 'Vila Panorama Ubud', city: 'Bali', catIdx: 1, price: 1250000, guests: 4, img: 0 },
    { name: 'Suite Menteng', city: 'Jakarta', catIdx: 0, price: 890000, guests: 2, img: 1 },
    { name: 'Cabin Lembang', city: 'Bandung', catIdx: 5, price: 760000, guests: 3, img: 2 },
    { name: 'Studio Malioboro', city: 'Yogyakarta', catIdx: 6, price: 640000, guests: 2, img: 3 },
    { name: 'Guesthouse Surabaya', city: 'Surabaya', catIdx: 4, price: 550000, guests: 2, img: 4 },
    { name: 'Resort Bali', city: 'Bali', catIdx: 3, price: 2100000, guests: 4, img: 5 },
    { name: 'Pentagon Jakarta', city: 'Jakarta', catIdx: 0, price: 1500000, guests: 3, img: 6 },
    { name: 'Villa Seminyak', city: 'Bali', catIdx: 1, price: 1800000, guests: 4, img: 7 },
    { name: 'Cabin Ciwidey', city: 'Bandung', catIdx: 5, price: 680000, guests: 2, img: 8 },
    { name: 'Studio Kotabaru', city: 'Yogyakarta', catIdx: 6, price: 590000, guests: 2, img: 9 },
    { name: 'Guesthouse Gubeng', city: 'Surabaya', catIdx: 4, price: 520000, guests: 2, img: 10 },
    { name: 'Resort Nusa Dua', city: 'Bali', catIdx: 3, price: 2800000, guests: 4, img: 11 },
    { name: 'Apartemen Kemang', city: 'Jakarta', catIdx: 0, price: 950000, guests: 2, img: 12 },
    { name: 'Villa Canggu', city: 'Bali', catIdx: 1, price: 1650000, guests: 4, img: 13 },
    { name: 'Cabin Pangalengan', city: 'Bandung', catIdx: 5, price: 720000, guests: 3, img: 14 },
    { name: 'Studio UGM', city: 'Yogyakarta', catIdx: 6, price: 580000, guests: 2, img: 15 },
    { name: 'Guesthouse Tunjungan', city: 'Surabaya', catIdx: 4, price: 670000, guests: 2, img: 16 },
    { name: 'Resort Sanur', city: 'Bali', catIdx: 3, price: 1950000, guests: 4, img: 17 },
  ];

  const createdProperties: any[] = [];
  for (const p of propertiesData) {
    const prop = await prisma.property.create({
      data: {
        name: p.name,
        city: p.city,
        address: `Jl. ${p.name} No. ${Math.floor(Math.random() * 200) + 1}`,
        province: p.city === 'Jakarta' ? 'DKI Jakarta' : p.city === 'Bali' ? 'Bali' : p.city === 'Bandung' ? 'Jawa Barat' : p.city === 'Yogyakarta' ? 'DI Yogyakarta' : 'Jawa Timur',
        latitude: -6 + Math.random() * 3,
        longitude: 106 + Math.random() * 10,
        description: `${p.name} — tempat menginap terbaik di ${p.city}`,
        tenantId: Math.random() > 0.5 ? tenant1.id : tenant2.id,
        categoryId: categories[p.catIdx].id,
      },
    });
    createdProperties.push(prop);
  }

  console.log('🏠 Created 18 properties');

  // Create images
  const imageData: { propertyId: string; url: string; order: number }[] = [];
  createdProperties.forEach((prop, i) => {
    imageData.push({ propertyId: prop.id, url: imagePool[i % imagePool.length], order: 0 });
  });
  await prisma.propertyImage.createMany({ data: imageData });
  console.log('📸 Created property images');

  // Create 1 room per property
  const createdRooms: any[] = [];
  for (let i = 0; i < propertiesData.length; i++) {
    const p = propertiesData[i];
    const room = await prisma.room.create({
      data: {
        propertyId: createdProperties[i].id,
        name: `${p.name} Room`,
        description: `Kamar untuk ${p.guests} tamu`,
        basePrice: p.price,
        maxGuests: p.guests,
      },
    });
    createdRooms.push(room);
  }

  console.log('🛏️ Created 18 rooms');

  // Availability
  const today = new Date();
  const availabilityData: { roomId: string; date: Date; isAvailable: boolean }[] = [];
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    createdRooms.forEach((room) => {
      availabilityData.push({ roomId: room.id, date, isAvailable: Math.random() > 0.15 });
    });
  }
  await prisma.roomAvailability.createMany({ data: availabilityData });
  console.log('📅 Created room availability for 60 days');

  // Seasonal rates
  await prisma.seasonalRate.createMany({
    data: [
      { roomId: createdRooms[0].id, name: 'Lebaran 2026', startDate: new Date('2026-04-01'), endDate: new Date('2026-04-10'), adjustmentType: 'PERCENTAGE', adjustmentValue: 30 },
      { roomId: createdRooms[5].id, name: 'Summer Peak', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), adjustmentType: 'PERCENTAGE', adjustmentValue: 25 },
      { roomId: createdRooms[11].id, name: 'Nyepi Special', startDate: new Date('2026-03-10'), endDate: new Date('2026-03-15'), adjustmentType: 'NOMINAL', adjustmentValue: 200000 },
      { roomId: createdRooms[2].id, name: 'Weekend Premium', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'), adjustmentType: 'PERCENTAGE', adjustmentValue: 15 },
    ],
  });
  console.log('💰 Created seasonal rates');

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('User 1: user1@example.com / password123');
  console.log('User 2: user2@example.com / password123');
  console.log('Tenant 1: tenant1@example.com / password123');
  console.log('Tenant 2: tenant2@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
