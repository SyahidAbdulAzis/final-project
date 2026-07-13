export const imagePool = [
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

export interface PropertySeed {
  name: string; city: string; address: string; province: string;
  lat: number; lng: number; desc: string; tenant: number; cat: number;
}

export const propertiesData: PropertySeed[] = [
  { name: 'Mentari Suites', city: 'Jakarta', address: 'Jl. Sudirman No. 123', province: 'DKI Jakarta', lat: -6.2088, lng: 106.8456, desc: 'Luxury apartment in the heart of Jakarta with city skyline view', tenant: 0, cat: 0 },
  { name: 'Bali Beach Villa', city: 'Bali', address: 'Jl. Pantai Kuta No. 45', province: 'Bali', lat: -8.3405, lng: 115.0920, desc: 'Beautiful villa near the beach with private pool and sunset view', tenant: 0, cat: 1 },
  { name: 'Bandung Highland Hotel', city: 'Bandung', address: 'Jl. Dago Atas No. 78', province: 'Jawa Barat', lat: -6.9175, lng: 107.6191, desc: 'Cozy hotel with mountain view and cool weather', tenant: 1, cat: 2 },
  { name: 'Vila Panorama Ubud', city: 'Bali', address: 'Jl. Raya Ubud No. 88', province: 'Bali', lat: -8.5069, lng: 115.2625, desc: 'Stunning rice terrace view villa with infinity pool', tenant: 0, cat: 1 },
  { name: 'Suite Menteng', city: 'Jakarta', address: 'Jl. Menteng Raya No. 12', province: 'DKI Jakarta', lat: -6.2000, lng: 106.8333, desc: 'Elegant suite in historic district near embassies', tenant: 1, cat: 0 },
  { name: 'Cabin Lembang', city: 'Bandung', address: 'Jl. Lembang No. 55', province: 'Jawa Barat', lat: -6.8112, lng: 107.6175, desc: 'Rustic cabin with pine forest view and fireplace', tenant: 0, cat: 2 },
  { name: 'Studio Malioboro', city: 'Yogyakarta', address: 'Jl. Malioboro No. 99', province: 'DI Yogyakarta', lat: -7.7971, lng: 110.3688, desc: 'Compact studio near Malioboro street and cultural sites', tenant: 1, cat: 0 },
  { name: 'Guesthouse Surabaya', city: 'Surabaya', address: 'Jl. Tunjungan No. 22', province: 'Jawa Timur', lat: -7.2575, lng: 112.7521, desc: 'Friendly guesthouse in city center near business district', tenant: 0, cat: 2 },
  { name: 'Resort Bali', city: 'Bali', address: 'Jl. Nusa Dua No. 1', province: 'Bali', lat: -8.8150, lng: 115.2225, desc: 'Beachfront resort with infinity pool and spa', tenant: 1, cat: 1 },
  { name: 'Pentagon Jakarta', city: 'Jakarta', address: 'Jl. Thamrin No. 77', province: 'DKI Jakarta', lat: -6.1944, lng: 106.8229, desc: 'Modern apartment near Grand Indonesia and shopping centers', tenant: 0, cat: 0 },
  { name: 'Villa Seminyak', city: 'Bali', address: 'Jl. Kayu Aya No. 33', province: 'Bali', lat: -8.6913, lng: 115.1680, desc: 'Private pool villa in Seminyak near beach clubs and restaurants', tenant: 1, cat: 1 },
  { name: 'Cabin Ciwidey', city: 'Bandung', address: 'Jl. Raya Ciwidey No. 10', province: 'Jawa Barat', lat: -7.2420, lng: 107.4450, desc: 'Tea plantation cabin retreat with strawberry farm nearby', tenant: 0, cat: 2 },
  { name: 'Studio Kotabaru', city: 'Yogyakarta', address: 'Jl. Kotabaru No. 5', province: 'DI Yogyakarta', lat: -7.7829, lng: 110.3671, desc: 'Minimalist studio in heritage area near Gajah Mada University', tenant: 1, cat: 0 },
  { name: 'Guesthouse Gubeng', city: 'Surabaya', address: 'Jl. Gubeng No. 44', province: 'Jawa Timur', lat: -7.2742, lng: 112.7391, desc: 'Comfortable guesthouse near Gubeng station and food street', tenant: 0, cat: 2 },
  { name: 'Resort Nusa Dua', city: 'Bali', address: 'Jl. Pratama No. 20', province: 'Bali', lat: -8.7800, lng: 115.2300, desc: 'Five-star resort experience with private beach access', tenant: 1, cat: 1 },
  { name: 'Apartemen Kemang', city: 'Jakarta', address: 'Jl. Kemang Raya No. 15', province: 'DKI Jakarta', lat: -6.2607, lng: 106.8136, desc: 'Trendy apartment in Kemang area near cafes and galleries', tenant: 0, cat: 0 },
  { name: 'Villa Canggu', city: 'Bali', address: 'Jl. Batu Bolong No. 60', province: 'Bali', lat: -8.6470, lng: 115.1370, desc: 'Surf villa near Canggu beach with rooftop terrace', tenant: 1, cat: 1 },
  { name: 'Cabin Pangalengan', city: 'Bandung', address: 'Jl. Pangalengan No. 7', province: 'Jawa Barat', lat: -7.2167, lng: 107.5667, desc: 'Scenic valley cabin with waterfall and hiking trails', tenant: 0, cat: 2 },
];

export interface RoomSeed {
  propIndex: number; name: string; desc: string; price: number; guests: number;
}

export const roomsData: RoomSeed[] = [
  { propIndex: 0, name: 'Deluxe Suite', desc: 'Spacious suite with king bed and city view', price: 550000, guests: 2 },
  { propIndex: 0, name: 'Executive Studio', desc: 'Modern studio with workspace area', price: 420000, guests: 2 },
  { propIndex: 0, name: 'Family Room', desc: 'Large room with two queen beds', price: 680000, guests: 4 },
  { propIndex: 1, name: 'Ocean View Villa', desc: 'Private villa with direct beach access', price: 920000, guests: 4 },
  { propIndex: 1, name: 'Garden Suite', desc: 'Garden-facing suite with terrace', price: 750000, guests: 3 },
  { propIndex: 1, name: 'Poolside Room', desc: 'Room with direct pool access', price: 880000, guests: 2 },
  { propIndex: 2, name: 'Mountain Suite', desc: 'Suite with panoramic mountain view', price: 430000, guests: 2 },
  { propIndex: 2, name: 'Standard Room', desc: 'Cozy room with heating and hot shower', price: 310000, guests: 2 },
  { propIndex: 3, name: 'Rice Terrace Villa', desc: 'Villa overlooking rice terraces', price: 780000, guests: 3 },
  { propIndex: 3, name: 'Ubud Suite', desc: 'Suite with traditional Balinese decor', price: 620000, guests: 2 },
  { propIndex: 4, name: 'City Loft', desc: 'Modern loft with Menteng heritage view', price: 620000, guests: 2 },
  { propIndex: 5, name: 'Forest Cabin', desc: 'Wooden cabin with fireplace and forest view', price: 380000, guests: 4 },
  { propIndex: 5, name: 'Budget Bunk', desc: 'Shared bunk room for backpackers', price: 180000, guests: 1 },
  { propIndex: 6, name: 'Heritage Room', desc: 'Room with Jogja cultural decor', price: 290000, guests: 2 },
  { propIndex: 7, name: 'Business Suite', desc: 'Suite with desk, WiFi, and coffee maker', price: 410000, guests: 2 },
  { propIndex: 7, name: 'Economy Room', desc: 'Simple room for short stays', price: 250000, guests: 2 },
  { propIndex: 8, name: 'Pool Villa', desc: 'Private pool villa with beach access', price: 1800000, guests: 6 },
  { propIndex: 9, name: 'Executive Room', desc: 'High-floor room with skyline view', price: 650000, guests: 3 },
  { propIndex: 9, name: 'Penthouse', desc: 'Top floor penthouse with panoramic view', price: 850000, guests: 4 },
  { propIndex: 10, name: 'Private Pool Villa', desc: 'Villa with private pool and garden', price: 1200000, guests: 4 },
  { propIndex: 11, name: 'Valley Retreat', desc: 'Cabin with valley and tea plantation view', price: 350000, guests: 5 },
  { propIndex: 12, name: 'Jogja Studio', desc: 'Minimalist studio near cultural sites', price: 310000, guests: 2 },
  { propIndex: 13, name: 'Gubeng Comfort', desc: 'Comfortable room near train station', price: 280000, guests: 2 },
  { propIndex: 14, name: 'Presidential Suite', desc: 'Luxury suite with private butler', price: 2200000, guests: 8 },
  { propIndex: 15, name: 'Kemang Studio', desc: 'Trendy studio near cafes and galleries', price: 480000, guests: 2 },
  { propIndex: 16, name: 'Surf Shack', desc: 'Beachfront room with surfboard storage', price: 950000, guests: 4 },
  { propIndex: 17, name: 'Waterfall Cabin', desc: 'Cabin near waterfall with hiking access', price: 420000, guests: 3 },
  { propIndex: 0, name: 'Sold Out Room', desc: 'Room yang sedang penuh dipesan', price: 500000, guests: 2 },
];

export interface SeasonalRateSeed {
  roomIndex: number; name: string; startDate: string; endDate: string;
  adjustmentType: 'PERCENTAGE' | 'NOMINAL'; adjustmentValue: number;
}

export const seasonalRatesData: SeasonalRateSeed[] = [
  { roomIndex: 0, name: 'Peak Season Jakarta', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 25 },
  { roomIndex: 1, name: 'Peak Season Jakarta', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 25 },
  { roomIndex: 3, name: 'Peak Season Bali', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 30 },
  { roomIndex: 4, name: 'Peak Season Bali', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 30 },
  { roomIndex: 5, name: 'Peak Season Bali', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 30 },
  { roomIndex: 10, name: 'Weekend Surcharge', startDate: '2026-07-18', endDate: '2026-07-19', adjustmentType: 'NOMINAL', adjustmentValue: 50000 },
  { roomIndex: 11, name: 'Weekend Surcharge', startDate: '2026-07-18', endDate: '2026-07-19', adjustmentType: 'NOMINAL', adjustmentValue: 30000 },
  { roomIndex: 17, name: 'Presidential Holiday', startDate: '2026-08-01', endDate: '2026-08-17', adjustmentType: 'PERCENTAGE', adjustmentValue: 15 },
  { roomIndex: 18, name: 'Presidential Holiday', startDate: '2026-08-01', endDate: '2026-08-17', adjustmentType: 'PERCENTAGE', adjustmentValue: 15 },
  { roomIndex: 20, name: 'Seminyak Peak', startDate: '2026-06-15', endDate: '2026-07-31', adjustmentType: 'PERCENTAGE', adjustmentValue: 35 },
  { roomIndex: 21, name: 'Ciwidey Weekend', startDate: '2026-07-18', endDate: '2026-07-19', adjustmentType: 'NOMINAL', adjustmentValue: 75000 },
];

export interface BookingSeed {
  roomIndex: number; userIndex: number; checkInOffset: number; nights: number;
  status: 'MENUNGGU_PEMBAYARAN' | 'MENUNGGU_KONFIRMASI' | 'DIKONFIRMASI' | 'DIBATALKAN' | 'KADALUARSA' | 'CANCEL';
  hasPayment?: boolean; hasReview?: boolean; rating?: number; comment?: string;
  tenantReply?: string;
}

export const bookingsData: BookingSeed[] = [
  // Booking selesai + sudah di-rating + tenant sudah balas
  { roomIndex: 0, userIndex: 0, checkInOffset: -10, nights: 3, status: 'DIKONFIRMASI', hasPayment: true, hasReview: true, rating: 5, comment: 'Suite yang sangat nyaman, view kotanya bagus sekali!', tenantReply: 'Terima kasih atas kunjungannya, sampai jumpa lagi!' },
  // Booking selesai + sudah di-rating + tenant belum balas
  { roomIndex: 1, userIndex: 1, checkInOffset: -5, nights: 2, status: 'DIKONFIRMASI', hasPayment: true, hasReview: true, rating: 4, comment: 'Lokasi strategis dekat pusat kota, recommended.' },
  // Booking selesai + BELUM di-rating (simulasi: tinggal isi rating)
  { roomIndex: 3, userIndex: 0, checkInOffset: -7, nights: 3, status: 'DIKONFIRMASI', hasPayment: true, hasReview: false },
  // Booking selesai + BELUM di-rating (user 2)
  { roomIndex: 5, userIndex: 1, checkInOffset: -4, nights: 2, status: 'DIKONFIRMASI', hasPayment: true, hasReview: false },
  // Booking ongoing (check-in hari ini, checkout besok)
  { roomIndex: 7, userIndex: 0, checkInOffset: 0, nights: 1, status: 'DIKONFIRMASI', hasPayment: true },
  // Booking menunggu pembayaran (belum upload bukti)
  { roomIndex: 4, userIndex: 1, checkInOffset: 7, nights: 2, status: 'MENUNGGU_PEMBAYARAN', hasPayment: false },
  // Booking menunggu konfirmasi (sudah upload bukti, tenant belum konfirmasi)
  { roomIndex: 10, userIndex: 0, checkInOffset: 5, nights: 3, status: 'MENUNGGU_KONFIRMASI', hasPayment: true },
  // Booking kadaluarsa (tidak bayar dalam 2 jam)
  { roomIndex: 11, userIndex: 1, checkInOffset: -3, nights: 1, status: 'KADALUARSA', hasPayment: false },
  // Booking dibatalkan user
  { roomIndex: 13, userIndex: 0, checkInOffset: 3, nights: 2, status: 'DIBATALKAN', hasPayment: false },
];
