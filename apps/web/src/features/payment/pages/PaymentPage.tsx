import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { Footer } from '../../../components/common/Footer';
import { getBookingById, submitManualPayment } from '../../booking/services/bookingApi';
import { uploadImage } from '../../property/services/uploadApi';
import { useAuth } from '../../auth/stores/AuthContext';
import { showToast } from '../../../components/common/Toast';
import { PaymentTimer } from '../components/PaymentTimer';
import { BookingDetailCard } from '../components/BookingDetailCard';
import { PaymentForm } from '../components/PaymentForm';
import { PaymentInfo } from '../components/PaymentInfo';
import type { BookingResponse } from '../../../types/booking';

export function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then((data) => { setBooking(data); setLoading(false); })
      .catch(() => { setError('Booking tidak ditemukan'); setLoading(false); });
  }, [bookingId]);

  useEffect(() => {
    if (!booking || booking.status !== 'MENUNGGU_PEMBAYARAN') return;
    const oneHourInMs = 60 * 60 * 1000;
    const elapsed = Date.now() - new Date(booking.createdAt).getTime();
    setTimeRemaining(oneHourInMs - elapsed);
  }, [booking]);

  useEffect(() => {
    if (!booking || booking.status !== 'MENUNGGU_PEMBAYARAN') return;
    const interval = setInterval(() => {
      const remaining = 60 * 60 * 1000 - (Date.now() - new Date(booking.createdAt).getTime());
      setTimeRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [booking]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) { setError('Ukuran file maksimal 1MB'); setProofFile(null); setPreviewUrl(''); return; }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) { setError('File harus berformat JPG atau PNG'); setProofFile(null); setPreviewUrl(''); return; }
    setProofFile(file);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (timeRemaining <= 0) { setError('Waktu untuk mengisi bukti pembayaran telah habis (1 jam). Silakan hubungi admin.'); return; }
    if (!proofFile) { setError('Silakan pilih file bukti transfer'); return; }
    setUploading(true);
    setError(null);
    try {
      const uploadedUrl = await uploadImage(proofFile);
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
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>Memuat...</p></main>
        <Footer />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="layout">
        <Navbar />
        <main style={{ padding: 40, maxWidth: 1360, margin: '0 auto' }}><p>{error}</p></main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="layout">
      <Navbar />
      <main style={{ padding: '28px 32px', maxWidth: 1360, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>Pembayaran</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Upload bukti transfer untuk booking Anda</p>
          <PaymentTimer timeRemaining={timeRemaining} />
        </div>

        {booking && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
            <div>
              <BookingDetailCard booking={booking} />
              <PaymentForm
                previewUrl={previewUrl} submitting={submitting} uploading={uploading}
                timeRemaining={timeRemaining} error={error}
                onFileChange={handleFileChange} onSubmit={handleSubmit}
              />
            </div>
            <PaymentInfo />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
