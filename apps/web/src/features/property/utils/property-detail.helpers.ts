export interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  availabilities: { date: string; isAvailable: boolean }[];
  seasonalRates: { name: string; startDate: string; endDate: string; adjustmentType: string; adjustmentValue: number }[];
  bookings: { checkIn: string; checkOut: string; status: string }[];
}

export function getDatesInRange(start: string, end: string) {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function buildAvailabilityMap(room?: Room) {
  if (!room) return {};
  const map: Record<string, boolean> = Object.fromEntries(room.availabilities.map((a) => [a.date.slice(0, 10), a.isAvailable]));
  if (room.bookings) {
    for (const b of room.bookings) {
      const dates = getDatesInRange(b.checkIn, b.checkOut);
      dates.pop();
      for (const d of dates) map[d] = false;
    }
  }
  return map;
}

export function getRoomPrice(room: Room, dateStr: string) {
  if (!dateStr) return room.basePrice;
  const dateKey = dateStr.slice(0, 10);
  const rate = room.seasonalRates.find((r) => {
    return dateKey >= r.startDate.slice(0, 10) && dateKey <= r.endDate.slice(0, 10);
  });
  if (!rate) return room.basePrice;
  return rate.adjustmentType === 'PERCENTAGE'
    ? Math.round(room.basePrice * (1 + rate.adjustmentValue / 100))
    : room.basePrice + rate.adjustmentValue;
}
