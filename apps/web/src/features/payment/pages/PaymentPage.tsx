import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getBookingById, submitManualPayment } from '../../booking/services/bookingApi';
import { uploadImage } from '../../property/services/uploadApi';
import { useAuth } from '../../auth/stores/AuthContext';
import type { BookingResponse } from '../../../types/booking';

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    setLoading(true);
    getBookingById(bookingId)
      .then((data) => {
        setBooking(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Booking tidak ditemukan');
        setLoading(false);
      });
  }, [bookingId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) {
      setError('Silakan pilih file bukti transfer');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Upload file first
      const uploadedUrl = await uploadImage(proofFile);
      
      // Then submit payment with the uploaded URL
      setSubmitting(true);
      await submitManualPayment(bookingId!, { proofUrl: uploadedUrl });
      alert('Pembayaran berhasil dikirim! Menunggu konfirmasi.');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim bukti pembayaran');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>Memuat...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}>
          <p>{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>
            Pembayaran
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
            Upload bukti transfer untuk booking Anda
          </p>
        </div>

        {booking && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
            <div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                  Detail Booking
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Booking ID</span>
                    <span style={{ fontWeight: 600 }}>{booking.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Kamar</span>
                    <span style={{ fontWeight: 600 }}>{booking.room.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Properti</span>
                    <span style={{ fontWeight: 600 }}>{booking.room.property.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Check-in</span>
                    <span style={{ fontWeight: 600 }}>{new Date(booking.checkIn).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--muted)' }}>Check-out</span>
                    <span style={{ fontWeight: 600 }}>{new Date(booking.checkOut).toLocaleDateString('id-ID')}</span>
                  </div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--primary)' }}>Rp {booking.totalPrice.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                  Upload Bukti Transfer
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
                      File Bukti Transfer
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      required
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        fontSize: '0.95rem',
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                      Pilih gambar bukti transfer (screenshot dari aplikasi banking)
                    </p>
                  </div>

                  {previewUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--muted)' }}>
                        Preview
                      </label>
                      <img
                        src={previewUrl}
                        alt="Preview bukti transfer"
                        style={{
                          width: '100%',
                          maxWidth: 400,
                          borderRadius: 8,
                          border: '1px solid var(--line)',
                        }}
                      />
                    </div>
                  )}
                  
                  {error && (
                    <div style={{ padding: 12, borderRadius: 8, backgroundColor: '#fee', color: '#c33', marginBottom: 16, fontSize: '0.9rem' }}>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || uploading}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 12,
                      border: 'none',
                      background: submitting || uploading ? 'var(--muted)' : 'var(--primary)',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: submitting || uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {uploading ? 'Mengupload...' : submitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 16, padding: 24, position: 'sticky', top: 100 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                  Informasi Pembayaran
                </h2>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.7 }}>
                  <p style={{ marginBottom: 12 }}>
                    Silakan transfer ke rekening berikut:
                  </p>
                  <div style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Bank</div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>BCA</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Nomor Rekening</div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>123-456-7890</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 4 }}>Atas Nama</div>
                    <div style={{ fontWeight: 600 }}>PT Villa Stay Indonesia</div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    Setelah transfer, upload bukti transfer di form di sebelah kiri. Status booking akan berubah menjadi "Menunggu Konfirmasi".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
