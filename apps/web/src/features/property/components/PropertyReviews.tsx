import type { ReviewItem } from '../../../types/property.js';

interface PropertyReviewsProps {
  reviews: ReviewItem[];
}

export function PropertyReviews({ reviews }: PropertyReviewsProps) {
  return (
    <section className="pd-section">
      <h2>Ulasan & Nilai</h2>
      {reviews.length === 0 ? (
        <p className="review-empty">Belum ada ulasan untuk properti ini.</p>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div>
                  <span className="review-author">{review.user.fullName}</span>
                  <p className="review-meta">{new Date(review.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <span className="review-rating">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              {review.tenantReply && (
                <div className="review-reply-box">
                  <div className="review-reply-label">Balasan dari pemilik</div>
                  <p className="review-reply-text">{review.tenantReply}</p>
                  {review.repliedAt && (
                    <div className="review-reply-date">{new Date(review.repliedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
