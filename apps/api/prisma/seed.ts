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

  // Create Properties (18 total)
  const propertiesData = [
    { name: 'Mentari Suites', city: 'Jakarta', address: 'Jl. Sudirman No. 123', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, desc: 'Luxury apartment in the heart of Jakarta', tenant: tenant1.id, cat: category1.id },
    { name: 'Bali Beach Villa', city: 'Bali', address: 'Jl. Pantai Kuta No. 45', province: 'Bali', lat: -8.3405, lng: 115.0920, desc: 'Beautiful villa near the beach', tenant: tenant1.id, cat: category2.id },
    { name: 'Bandung Highland Hotel', city: 'Bandung', address: 'Jl. Dago Atas No. 78', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, desc: 'Cozy hotel with mountain view', tenant: tenant2.id, cat: category3.id },
    { name: 'Vila Panorama Ubud', city: 'Bali', address: 'Jl. Raya Ubud No. 88', province: 'Bali', lat: -8.5069, lng: 115.2625, desc: 'Stunning rice terrace view villa', tenant: tenant1.id, cat: category2.id },
    { name: 'Suite Menteng', city: 'Jakarta', address: 'Jl. Menteng Raya No. 12', province: 'DKI Jakarta', lat: -6.2000, lng: 106.8333, desc: 'Elegant suite in historic district', tenant: tenant2.id, cat: category1.id },
    { name: 'Cabin Lembang', city: 'Bandung', address: 'Jl. Lembang No. 55', province: 'Jawa Barat', lat: -6.8112, lng: 107.6175, desc: 'Rustic cabin with pine forest view', tenant: tenant1.id, cat: category3.id },
    { name: 'Studio Malioboro', city: 'Yogyakarta', address: 'Jl. Malioboro No. 99', province: 'DI Yogyakarta', lat: -7.7971, lng: 110.3688, desc: 'Compact studio near Malioboro street', tenant: tenant2.id, cat: category1.id },
    { name: 'Guesthouse Surabaya', city: 'Surabaya', address: 'Jl. Tunjungan No. 22', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, desc: 'Friendly guesthouse in city center', tenant: tenant1.id, cat: category3.id },
    { name: 'Resort Bali', city: 'Bali', address: 'Jl. Nusa Dua No. 1', province: 'Bali', lat: -8.8150, lng: 115.2225, desc: 'Beachfront resort with infinity pool', tenant: tenant2.id, cat: category2.id },
    { name: 'Pentagon Jakarta', city: 'Jakarta', address: 'Jl. Thamrin No. 77', province: 'DKI Jakarta', lat: -6.1944, lng: 106.8229, desc: 'Modern apartment near Grand Indonesia', tenant: tenant1.id, cat: category1.id },
    { name: 'Villa Seminyak', city: 'Bali', address: 'Jl. Kayu Aya No. 33', province: 'Bali', lat: -8.6913, lng: 115.1680, desc: 'Private pool villa in Seminyak', tenant: tenant2.id, cat: category2.id },
    { name: 'Cabin Ciwidey', city: 'Bandung', address: 'Jl. Raya Ciwidey No. 10', province: 'Jawa Barat', lat: -7.2420, lng: 107.4450, desc: 'Tea plantation cabin retreat', tenant: tenant1.id, cat: category3.id },
    { name: 'Studio Kotabaru', city: 'Yogyakarta', address: 'Jl. Kotabaru No. 5', province: 'DI Yogyakarta', lat: -7.7829, lng: 110.3671, desc: 'Minimalist studio in heritage area', tenant: tenant2.id, cat: category1.id },
    { name: 'Guesthouse Gubeng', city: 'Surabaya', address: 'Jl. Gubeng No. 44', province: 'Jawa Timur', lat: -7.2742, lng: 112.7391, desc: 'Comfortable guesthouse near Gubeng station', tenant: tenant1.id, cat: category3.id },
    { name: 'Resort Nusa Dua', city: 'Bali', address: 'Jl. Pratama No. 20', province: 'Bali', lat: -8.7800, lng: 115.2300, desc: 'Five-star resort experience', tenant: tenant2.id, cat: category2.id },
    { name: 'Apartemen Kemang', city: 'Jakarta', address: 'Jl. Kemang Raya No. 15', province: 'DKI Jakarta', lat: -6.2607, lng: 106.8136, desc: 'Trendy apartment in Kemang area', tenant: tenant1.id, cat: category1.id },
    { name: 'Villa Canggu', city: 'Bali', address: 'Jl. Batu Bolong No. 60', province: 'Bali', lat: -8.6470, lng: 115.1370, desc: 'Surf villa near Canggu beach', tenant: tenant2.id, cat: category2.id },
    { name: 'Cabin Pangalengan', city: 'Bandung', address: 'Jl. Pangalengan No. 7', province: 'Jawa Barat', lat: -7.2167, lng: 107.5667, desc: 'Scenic valley cabin with waterfall', tenant: tenant1.id, cat: category3.id },
  ];

  const createdProps: { id: string; city: string }[] = [];
  for (const p of propertiesData) {
    const prop = await prisma.property.create({
      data: {
        name: p.name,
        city: p.city,
        address: p.address,
        province: p.province,
        latitude: p.lat,
        longitude: p.lng,
        description: p.desc,
        tenantId: p.tenant,
        categoryId: p.cat,
      },
    });
    createdProps.push({ id: prop.id, city: p.city });
  }
  console.log(`🏠 Created ${createdProps.length} properties`);

  // Create Property Images (1 image per property)
  const imageUrls = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800',
    'https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800',
    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800',
    'https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800',
  ];

  const imageData = createdProps.map((prop, i) => ({
    propertyId: prop.id,
    url: imageUrls[i % imageUrls.length],
    order: 0,
  }));
  await prisma.propertyImage.createMany({ data: imageData });
  console.log('📸 Created property images');

  // Create Rooms (1 room per property)
  const roomNames = ['Deluxe Suite', 'Ocean View', 'Mountain Suite', 'Garden Room', 'City Loft', 'Forest Cabin', 'Heritage Room', 'Business Suite', 'Pool Villa', 'Executive Room', 'Penthouse', 'Valley Retreat', 'Jogja Studio', 'Economy Room', 'Presidential Suite', 'Kemang Studio', 'Surf Shack', 'Waterfall Cabin'];
  const roomPrices = [550000, 920000, 430000, 780000, 620000, 380000, 290000, 410000, 1800000, 650000, 850000, 350000, 310000, 250000, 2200000, 480000, 950000, 420000];
  const roomGuests = [2, 4, 2, 3, 2, 4, 2, 2, 6, 3, 4, 5, 2, 2, 8, 2, 4, 3];

  const createdRooms: { id: string }[] = [];
  for (let i = 0; i < createdProps.length; i++) {
    const room = await prisma.room.create({
      data: {
        propertyId: createdProps[i].id,
        name: roomNames[i],
        description: `${roomNames[i]} with premium amenities`,
        basePrice: roomPrices[i],
        maxGuests: roomGuests[i],
      },
    });
    createdRooms.push({ id: room.id });
  }
  console.log(`🛏️ Created ${createdRooms.length} rooms`);

  // Create Room Availability for next 30 days
  const today = new Date();
  const availabilityData: { roomId: string; date: Date; isAvailable: boolean }[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    for (const room of createdRooms) {
      availabilityData.push({ roomId: room.id, date, isAvailable: true });
    }
  }
  await prisma.roomAvailability.createMany({ data: availabilityData });
  console.log('📅 Created room availability for 30 days');

  // Create Seasonal Rates
  await prisma.seasonalRate.create({
    data: {
      roomId: createdRooms[1].id,
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
