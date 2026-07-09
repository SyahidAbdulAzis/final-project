import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getBookingById, submitManualPayment } from '../../booking/services/bookingApi';
import { uploadImage } from '../../property/services/uploadApi';
import { useAuth } from '../../auth/stores/AuthContext';
import { showToast } from '../../../components/common/Toast';
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

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

  // Check if booking is expired on load and initialize countdown
  useEffect(() => {
    if (booking && booking.status === 'MENUNGGU_PEMBAYARAN') {
      const oneHourInMs = 60 * 60 * 1000;
      const timeElapsed = Date.now() - new Date(booking.createdAt).getTime();
      const remaining = oneHourInMs - timeElapsed;
      setTimeRemaining(remaining);
      
      if (timeElapsed > oneHourInMs) {
        setError('Waktu pembayaran telah habis (1 jam). Booking telah kadaluarsa.');
      }
    }
  }, [booking]);

  // Timer for 1 hour limit based on booking creation time
  useEffect(() => {
    if (!booking || booking.status !== 'MENUNGGU_PEMBAYARAN') return;
    
    const interval = setInterval(() => {
      const oneHourInMs = 60 * 60 * 1000;
      const timeElapsed = Date.now() - new Date(booking.createdAt).getTime();
      const remaining = oneHourInMs - timeElapsed;
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} jam ${minutes % 60} menit`;
    }
    return `${minutes} menit ${seconds % 60} detik`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 1MB)
      const maxSize = 1 * 1024 * 1024; // 1MB in bytes
      if (file.size > maxSize) {
        setError('Ukuran file maksimal 1MB');
        setProofFile(null);
        setPreviewUrl('');
        return;
      }

      // Validate file type (JPG or PNG only)
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('File harus berformat JPG atau PNG');
        setProofFile(null);
        setPreviewUrl('');
        return;
      }

      setProofFile(file);
      setError(null);
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
    
    // Check if time is up
    if (timeRemaining <= 0) {
      setError('Waktu untuk mengisi bukti pembayaran telah habis (1 jam). Silakan hubungi admin.');
      return;
    }
    
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
      showToast('Pembayaran berhasil dikirim! Menunggu konfirmasi.', 'success');
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
          <div style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            backgroundColor: timeRemaining <= 0 ? '#fee' : '#e3f2fd',
            border: `1px solid ${timeRemaining <= 0 ? '#c33' : '#2196f3'}`,
          }}>
            <p style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: timeRemaining <= 0 ? '#c33' : '#1976d2',
              margin: 0,
            }}>
              {timeRemaining <= 0
                ? 'Waktu habis! Silakan hubungi admin.'
                : `Sisa waktu: ${formatTime(timeRemaining)}`
              }
            </p>
          </div>
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
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      required
                      disabled={timeRemaining <= 0}
                      style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 8,
                        border: '1px solid var(--line)',
                        fontSize: '0.95rem',
                        backgroundColor: timeRemaining <= 0 ? '#f5f5f5' : '#fff',
                        cursor: timeRemaining <= 0 ? 'not-allowed' : 'pointer',
                      }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 4 }}>
                      Format: JPG atau PNG, Maksimal: 1MB
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
                    disabled={submitting || uploading || timeRemaining <= 0}
                    style={{
                      width: '100%',
                      padding: 14,
                      borderRadius: 12,
                      border: 'none',
                      background: submitting || uploading || timeRemaining <= 0 ? 'var(--muted)' : 'var(--primary)',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: submitting || uploading || timeRemaining <= 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {timeRemaining <= 0
                      ? 'Waktu Habis'
                      : uploading
                      ? 'Mengupload...'
                      : submitting
                      ? 'Mengirim...'
                      : 'Kirim Bukti Pembayaran'
                    }
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
