/// <reference types="node" />

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
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

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      passwordHash,
      fullName: 'John Doe',
      photoUrl: 'https://i.pravatar.cc/150?img=1',
      role: 'USER',
      isVerified: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      passwordHash,
      fullName: 'Jane Smith',
      photoUrl: 'https://i.pravatar.cc/150?img=2',
      role: 'USER',
      isVerified: true,
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: 'tenant1@example.com',
      passwordHash,
      fullName: 'Tenant One',
      photoUrl: 'https://i.pravatar.cc/150?img=3',
      role: 'TENANT',
      isVerified: true,
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'tenant2@example.com',
      passwordHash,
      fullName: 'Tenant Two',
      photoUrl: 'https://i.pravatar.cc/150?img=4',
      role: 'TENANT',
      isVerified: true,
    },
  });

  console.log('👤 Created 4 users');

  // Create Property Categories
  const category1 = await prisma.propertyCategory.create({
    data: {
      name: 'Apartment',
    },
  });

  const category2 = await prisma.propertyCategory.create({
    data: {
      name: 'Villa',
    },
  });

  const category3 = await prisma.propertyCategory.create({
    data: {
      name: 'Hotel',
    },
  });

  console.log('🏷️ Created 3 property categories');

  // Create Properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Mentari Suites',
      city: 'Jakarta',
      address: 'Jl. Sudirman No. 123',
      province: 'DKI Jakarta',
      latitude: -6.2088,
      longitude: 106.8456,
      description: 'Luxury apartment in the heart of Jakarta',
      tenantId: tenant1.id,
      categoryId: category1.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Bali Beach Villa',
      city: 'Bali',
      address: 'Jl. Pantai Kuta No. 45',
      province: 'Bali',
      latitude: -8.3405,
      longitude: 115.0920,
      description: 'Beautiful villa near the beach',
      tenantId: tenant1.id,
      categoryId: category2.id,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      name: 'Bandung Highland Hotel',
      city: 'Bandung',
      address: 'Jl. Dago Atas No. 78',
      province: 'Jawa Barat',
      latitude: -6.9175,
      longitude: 107.6191,
      description: 'Cozy hotel with mountain view',
      tenantId: tenant2.id,
      categoryId: category3.id,
    },
  });

  console.log('🏠 Created 3 properties');

  // Create Property Images
  await prisma.propertyImage.createMany({
    data: [
      {
        propertyId: property1.id,
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
        order: 0,
      },
      {
        propertyId: property1.id,
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
        order: 1,
      },
      {
        propertyId: property2.id,
        url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200',
        order: 0,
      },
      {
        propertyId: property3.id,
        url: 'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=1200',
        order: 0,
      },
    ],
  });

  console.log('📸 Created property images');

  // Create Rooms
  const room1 = await prisma.room.create({
    data: {
      propertyId: property1.id,
      name: 'Deluxe Suite',
      description: 'Spacious room with city view',
      basePrice: 550000,
      maxGuests: 2,
    },
  });

  const room2 = await prisma.room.create({
    data: {
      propertyId: property1.id,
      name: 'Premium Suite',
      description: 'Luxury room with balcony',
      basePrice: 750000,
      maxGuests: 3,
    },
  });

  const room3 = await prisma.room.create({
    data: {
      propertyId: property2.id,
      name: 'Beach View Room',
      description: 'Room with ocean view',
      basePrice: 920000,
      maxGuests: 4,
    },
  });

  const room4 = await prisma.room.create({
    data: {
      propertyId: property3.id,
      name: 'Mountain View Room',
      description: 'Room with mountain view',
      basePrice: 430000,
      maxGuests: 2,
    },
  });

  console.log('🛏️ Created 4 rooms');

  // Create Room Availability for next 30 days
  const today = new Date();
  const availabilityData: { roomId: string; date: Date; isAvailable: boolean }[] = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    [room1, room2, room3, room4].forEach(room => {
      availabilityData.push({
        roomId: room.id,
        date,
        isAvailable: true,
      });
    });
  }

  await prisma.roomAvailability.createMany({
    data: availabilityData,
  });

  console.log('📅 Created room availability for 30 days');

  // Create Seasonal Rates
  await prisma.seasonalRate.create({
    data: {
      roomId: room3.id,
      name: 'Peak Season',
      startDate: new Date('2024-12-20'),
      endDate: new Date('2025-01-05'),
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 20,
    },
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
