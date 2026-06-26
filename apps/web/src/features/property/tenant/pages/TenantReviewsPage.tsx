import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantReviews, replyToReview, type ReviewResponse } from '../../../booking/services/reviewApi.js';
import { useAuth } from '../../../auth/stores/AuthContext.js';

export function TenantReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.role !== 'tenant') return;
    setLoading(true);
    getTenantReviews()
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

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
      alert('Gagal mengirim balasan');
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
        <p style={{ color: 'var(--muted)' }}>Memuat...</p>
      ) : reviews.length === 0 ? (
        <div className="tenant-card">
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Belum ada review untuk properti Anda.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {reviews.map((review) => (
            <div key={review.id} className="tenant-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    {review.user?.fullName || 'Pengguna'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                    {review.booking?.room.property.name || ''} — Kamar {review.booking?.room.name || ''}
                  </div>
                </div>
                <div style={{ color: '#f5a623', fontSize: '0.9rem' }}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, marginBottom: 8 }}>
                {review.comment}
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 12 }}>
                {formatDate(review.createdAt)}
              </div>

              {review.tenantReply ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginTop: 4,
                }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#166534', marginBottom: 4 }}>
                    Balasan Anda:
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#166534', lineHeight: 1.4 }}>{review.tenantReply}</p>
                  {review.repliedAt && (
                    <div style={{ fontSize: '0.7rem', color: '#166534', marginTop: 4, opacity: 0.7 }}>
                      Dibalas pada {formatDate(review.repliedAt)}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 4 }}>
                  <textarea
                    placeholder="Tulis balasan Anda..."
                    value={replyText[review.id] || ''}
                    onChange={(e) => setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))}
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--line)',
                      fontSize: '0.85rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleReply(review.id)}
                    disabled={submitting[review.id] || !replyText[review.id]?.trim()}
                    className="btn-primary"
                    style={{ marginTop: 8, padding: '6px 16px', fontSize: '0.85rem' }}
                  >
                    {submitting[review.id] ? 'Mengirim...' : 'Balas'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </TenantLayout>
  );
}
