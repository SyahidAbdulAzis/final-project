import prisma from '../lib/prisma.js';

export type RatingMap = Map<string, { rating: number; count: number }>;
export type ReviewsMap = Map<string, Array<{ rating: number; comment: string }>>;

export async function fetchRatingAndReviews(propertyIds: string[]): Promise<{ ratingMap: RatingMap; reviewsMap: ReviewsMap }> {
  if (propertyIds.length === 0) return { ratingMap: new Map(), reviewsMap: new Map() };

  const [ratingRowsRaw, reviewRowsRaw] = await Promise.all([
    prisma.$queryRaw`
      SELECT rm."propertyId", ROUND(AVG(r.rating)::numeric, 1) as "avgRating", COUNT(r.id)::int as "count"
      FROM "Review" r
      JOIN "Booking" b ON b.id = r."bookingId"
      JOIN "Room" rm ON rm.id = b."roomId"
      WHERE rm."propertyId" = ANY(${propertyIds})
      GROUP BY rm."propertyId"
    `,
    prisma.$queryRaw`
      SELECT rm."propertyId", r.rating, r.comment
      FROM "Review" r
      JOIN "Booking" b ON b.id = r."bookingId"
      JOIN "Room" rm ON rm.id = b."roomId"
      WHERE rm."propertyId" = ANY(${propertyIds})
      ORDER BY r."createdAt" DESC
    `,
  ]);

  const ratingRows = ratingRowsRaw as Array<{ propertyId: string; avgRating: number; count: number }>;
  const reviewRows = reviewRowsRaw as Array<{ propertyId: string; rating: number; comment: string }>;
  const ratingMap: RatingMap = new Map(ratingRows.map((r) => [r.propertyId, { rating: Number(r.avgRating), count: r.count }]));
  const reviewsMap: ReviewsMap = new Map();
  for (const rev of reviewRows) {
    if (!reviewsMap.has(rev.propertyId)) reviewsMap.set(rev.propertyId, []);
    reviewsMap.get(rev.propertyId)!.push({ rating: rev.rating, comment: rev.comment });
  }

  return { ratingMap, reviewsMap };
}
