import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantReviews, replyToReview, type ReviewResponse } from '../../../booking/services/reviewApi.js';
import { useAuth } from '../../../auth/stores/AuthContext.js';
import { showToast } from '../../../../components/common/Toast.js';

export function TenantReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (user?.role !== 'tenant') return;
    setLoading(true);
    getTenantReviews(currentPage, 5)
      .then((result) => {
        setReviews(result.reviews);
        setTotalPages(result.totalPages);
        setTotal(result.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, currentPage]);

  const handleReply = async (reviewId: string) => {
    const reply = replyText[reviewId]?.trim();
    if (!reply) return;

    setSubmitting((prev) => ({ ...prev, [reviewId]: true }));
    try {
      await replyToReview(reviewId, { reply });
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, tenantReply: reply, repliedAt: new Date().toISOString() } : r,
        ),
      );
      setReplyText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch {
      showToast('Gagal mengirim balasan', 'error');
    } finally {
      setSubmitting((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <TenantLayout>
      {loading ? (
        <p className="review-loading">Memuat...</p>
      ) : reviews.length === 0 ? (
        <div className="tenant-card">
          <p className="review-empty">Belum ada review untuk properti Anda.</p>
        </div>
      ) : (
        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="tenant-card">
              <div className="review-header">
                <div>
                  <div className="review-author">
                    {review.user?.fullName || 'Pengguna'}
                  </div>
                  <div className="review-meta">
                    {review.booking?.room.property.name || ''} — Kamar {review.booking?.room.name || ''}
                  </div>
                </div>
                <div className="review-rating">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="review-comment">
                {review.comment}
              </p>
              <div className="review-date">
                {formatDate(review.createdAt)}
              </div>

              {review.tenantReply ? (
                <div className="review-reply-box">
                  <div className="review-reply-label">
                    Balasan Anda:
                  </div>
                  <p className="review-reply-text">{review.tenantReply}</p>
                  {review.repliedAt && (
                    <div className="review-reply-date">
                      Dibalas pada {formatDate(review.repliedAt)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="review-reply-form">
                  <textarea
                    placeholder="Tulis balasan Anda..."
                    value={replyText[review.id] || ''}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    rows={2}
                    className="review-reply-input"
                  />
                  <button
                    type="button"
                    onClick={() => handleReply(review.id)}
                    disabled={submitting[review.id] || !replyText[review.id]?.trim()}
                    className="btn-primary review-reply-btn"
                  >
                    {submitting[review.id] ? 'Mengirim...' : 'Balas'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24, padding: 16 }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  color: currentPage === 1 ? 'var(--muted)' : 'var(--text)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
                Halaman {currentPage} dari {totalPages} ({total} total)
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  color: currentPage === totalPages ? 'var(--muted)' : 'var(--text)',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </TenantLayout>
  );
}
