import prisma from '../lib/prisma.js';

export interface SalesReportData {
  propertyId: string;
  propertyName: string;
  totalSales: number;
  transactionCount: number;
  bookings: Array<{
    id: string;
    userId: string;
    userName: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: string;
    createdAt: Date;
  }>;
}

export async function getSalesReportByProperty(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
): Promise<SalesReportData[]> {
  const where: any = {
    room: {
      property: {
        tenantId,
      },
    },
    status: 'DIKONFIRMASI',
  };

  if (startDate && endDate) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  // Group by property
  const propertyMap = new Map<string, SalesReportData>();

  bookings.forEach((booking: any) => {
    const propertyId = booking.room.property.id;
    const propertyName = booking.room.property.name;

    if (!propertyMap.has(propertyId)) {
      propertyMap.set(propertyId, {
        propertyId,
        propertyName,
        totalSales: 0,
        transactionCount: 0,
        bookings: [],
      });
    }

    const propertyData = propertyMap.get(propertyId)!;
    propertyData.totalSales += booking.totalPrice;
    propertyData.transactionCount += 1;
    propertyData.bookings.push({
      id: booking.id,
      userId: booking.userId,
      userName: booking.user.fullName,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    });
  });

  return Array.from(propertyMap.values());
}

export async function getSalesReportByUser(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
): Promise<Array<{
  userId: string;
  userName: string;
  userEmail: string;
  totalSales: number;
  transactionCount: number;
  bookings: Array<{
    id: string;
    propertyName: string;
    checkIn: Date;
    checkOut: Date;
    totalPrice: number;
    status: string;
    createdAt: Date;
  }>;
}>> {
  const where: any = {
    room: {
      property: {
        tenantId,
      },
    },
    status: 'DIKONFIRMASI',
  };

  if (startDate && endDate) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  // Group by user
  const userMap = new Map<string, any>();

  bookings.forEach((booking: any) => {
    const userId = booking.userId;
    const userName = booking.user.fullName;
    const userEmail = booking.user.email;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userId,
        userName,
        userEmail,
        totalSales: 0,
        transactionCount: 0,
        bookings: [],
      });
    }

    const userData = userMap.get(userId)!;
    userData.totalSales += booking.totalPrice;
    userData.transactionCount += 1;
    userData.bookings.push({
      id: booking.id,
      propertyName: booking.room.property.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
    });
  });

  return Array.from(userMap.values());
}

export async function getSalesReportByTransaction(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  sortBy?: 'date' | 'totalSales'
): Promise<Array<{
  id: string;
  propertyName: string;
  userName: string;
  userEmail: string;
  checkIn: Date;
  checkOut: Date;
  totalPrice: number;
  status: string;
  createdAt: Date;
}>> {
  const where: any = {
    room: {
      property: {
        tenantId,
      },
    },
    status: 'DIKONFIRMASI',
  };

  if (startDate && endDate) {
    where.createdAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      room: {
        include: {
          property: true,
        },
      },
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: sortBy === 'totalSales' ? { totalPrice: 'desc' } : { createdAt: 'desc' },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    propertyName: booking.room.property.name,
    userName: booking.user.fullName,
    userEmail: booking.user.email,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    totalPrice: booking.totalPrice,
    status: booking.status,
    createdAt: booking.createdAt,
  }));
}

export interface PropertyAvailabilityData {
  propertyId: string;
  propertyName: string;
  propertyCity: string;
  rooms: Array<{
    roomId: string;
    roomName: string;
    bookings: Array<{
      id: string;
      checkIn: Date;
      checkOut: Date;
      status: string;
    }>;
  }>;
}

export async function getPropertyAvailabilityCalendar(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<PropertyAvailabilityData[]> {
  const properties = await prisma.property.findMany({
    where: {
      tenantId,
    },
    include: {
      rooms: {
        include: {
          bookings: {
            where: {
              OR: [
                {
                  checkIn: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
                {
                  checkOut: {
                    gte: startDate,
                    lte: endDate,
                  },
                },
                {
                  checkIn: {
                    lte: startDate,
                  },
                  checkOut: {
                    gte: endDate,
                  },
                },
              ],
            },
            orderBy: {
              checkIn: 'asc',
            },
          },
        },
      },
    },
  });

  return properties.map((property: any) => ({
    propertyId: property.id,
    propertyName: property.name,
    propertyCity: property.city,
    rooms: property.rooms.map((room: any) => ({
      roomId: room.id,
      roomName: room.name,
      bookings: room.bookings.map((booking: any) => ({
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status,
      })),
    })),
  }));
}
