/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  imagePool, propertiesData, roomsData, seasonalRatesData, bookingsData,
} from './seed-data.js';

const prisma = new PrismaClient();

async function cleanAll() {
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
}

async function createUsers(passwordHash: string) {
  const users = await Promise.all([
    prisma.user.create({ data: { email: 'user1@example.com', passwordHash, fullName: 'John Doe', photoUrl: 'https://i.pravatar.cc/150?img=1', role: 'USER', isVerified: true } }),
    prisma.user.create({ data: { email: 'user2@example.com', passwordHash, fullName: 'Jane Smith', photoUrl: 'https://i.pravatar.cc/150?img=2', role: 'USER', isVerified: true } }),
    prisma.user.create({ data: { email: 'tenant1@example.com', passwordHash, fullName: 'Tenant One', photoUrl: 'https://i.pravatar.cc/150?img=3', role: 'TENANT', isVerified: true } }),
    prisma.user.create({ data: { email: 'tenant2@example.com', passwordHash, fullName: 'Tenant Two', photoUrl: 'https://i.pravatar.cc/150?img=4', role: 'TENANT', isVerified: true } }),
  ]);
  console.log('👤 Created 4 users');
  return users;
}

async function createCategories() {
  const cats = await Promise.all([
    prisma.propertyCategory.create({ data: { name: 'Apartment' } }),
    prisma.propertyCategory.create({ data: { name: 'Villa' } }),
    prisma.propertyCategory.create({ data: { name: 'Hotel' } }),
  ]);
  console.log('🏷️ Created 3 property categories');
  return cats;
}

async function createProperties(tenantIds: string[], catIds: string[]) {
  const createdProps: string[] = [];
  for (const p of propertiesData) {
    const prop = await prisma.property.create({
      data: { name: p.name, city: p.city, address: p.address, province: p.province, latitude: p.lat, longitude: p.lng, description: p.desc, tenantId: tenantIds[p.tenant], categoryId: catIds[p.cat] },
    });
    createdProps.push(prop.id);
  }
  console.log(`🏠 Created ${createdProps.length} properties`);
  return createdProps;
}

async function createPropertyImages(propIds: string[]) {
  const imageData = propIds.map((propId, i) => ({ propertyId: propId, url: imagePool[i % imagePool.length], order: 0 }));
  await prisma.propertyImage.createMany({ data: imageData });
  console.log('📸 Created property images');
}

async function createRooms(propIds: string[]) {
  const createdRooms: { id: string; price: number }[] = [];
  for (const r of roomsData) {
    const room = await prisma.room.create({
      data: { propertyId: propIds[r.propIndex], name: r.name, description: r.desc, basePrice: r.price, maxGuests: r.guests },
    });
    createdRooms.push({ id: room.id, price: r.price });
  }
  console.log(`🛏️ Created ${createdRooms.length} rooms`);
  return createdRooms;
}

async function createAvailability(roomIds: string[]) {
  const today = new Date();
  const data: { roomId: string; date: Date; isAvailable: boolean }[] = [];
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    for (const roomId of roomIds) {
      const isAvailable = !(i >= 10 && i <= 14);
      data.push({ roomId, date, isAvailable });
    }
  }
  await prisma.roomAvailability.createMany({ data });
  console.log('📅 Created room availability for 60 days (with 5 unavailable days per room)');
}

async function createSeasonalRates(roomIds: { id: string }[]) {
  for (const sr of seasonalRatesData) {
    await prisma.seasonalRate.create({
      data: { roomId: roomIds[sr.roomIndex].id, name: sr.name, startDate: new Date(sr.startDate), endDate: new Date(sr.endDate), adjustmentType: sr.adjustmentType, adjustmentValue: sr.adjustmentValue },
    });
  }
  console.log(`💰 Created ${seasonalRatesData.length} seasonal rates (nominal & percentage)`);
}

async function createBookings(roomIds: { id: string; price: number }[], userIds: string[]) {
  const today = new Date();
  for (const b of bookingsData) {
    const checkIn = new Date(today);
    checkIn.setDate(checkIn.getDate() + b.checkInOffset);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + b.nights);
    const totalPrice = roomIds[b.roomIndex].price * b.nights;
    const expiresAt = b.status === 'MENUNGGU_PEMBAYARAN' ? new Date(Date.now() + 2 * 60 * 60 * 1000) : null;

    const booking = await prisma.booking.create({
      data: { userId: userIds[b.userIndex], roomId: roomIds[b.roomIndex].id, checkIn, checkOut, totalPrice, status: b.status, expiresAt },
    });

    if (b.hasPayment) {
      await prisma.payment.create({ data: { bookingId: booking.id, proofUrl: 'https://images.unsplash.com/photo-1554224155-6726b1ffcb39?w=800' } });
    }
    if (b.hasReview && b.rating && b.comment) {
      await prisma.review.create({ data: { bookingId: booking.id, userId: userIds[b.userIndex], rating: b.rating, comment: b.comment } });
    }
  }
  console.log(`� Created ${bookingsData.length} bookings (with payments & reviews)`);
}

async function main() {
  console.log('🌱 Starting seed...');
  await cleanAll();
  const passwordHash = await bcrypt.hash('password123', 10);
  const users = await createUsers(passwordHash);
  const cats = await createCategories();
  const tenantIds = [users[2].id, users[3].id];
  const catIds = cats.map((c) => c.id);
  const propIds = await createProperties(tenantIds, catIds);
  await createPropertyImages(propIds);
  const roomIds = await createRooms(propIds);
  await createAvailability(roomIds.map((r) => r.id));
  await createSeasonalRates(roomIds);
  await createBookings(roomIds, [users[0].id, users[1].id]);

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
