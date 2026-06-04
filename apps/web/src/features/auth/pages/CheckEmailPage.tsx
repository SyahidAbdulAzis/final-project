import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { resendVerificationApi } from '../services/authApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

export function CheckEmailPage() {
  const { state } = useLocation();
  const email: string = state?.email || '';
  const role: string = state?.role || 'user';
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    setError('');
    try {
      if (email) await resendVerificationApi(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Gagal mengirim ulang email. Coba lagi.');
    }
  };

  return (
    <div className="layout">
      <Navbar variant="minimal" />
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="auth-title">Cek Email Anda</h1>
          <p className="auth-subtitle">
            Kami telah mengirimkan email verifikasi. Silakan cek kotak masuk Anda.
          </p>

          <div className="check-email-icon">
            <div className="icon-circle">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>

          <div className="check-email-info">
            <p>
              Email berisi link untuk verifikasi dan pengaturan password.
              Link berlaku selama <strong>1 jam</strong>.
            </p>
          </div>

          <div className="check-email-actions">
            <p className="resend-text">
              Tidak menerima email?
            </p>
            {error && <p className="field-error api-error">{error}</p>}
            <button
              type="button"
              className="btn-primary"
              onClick={handleResend}
              disabled={resent}
            >
              {resent ? 'Terkirim!' : 'Kirim Ulang Email'}
            </button>

            <div className="check-email-divider" />

            <a href={`/login/${role}`} className="btn-secondary">
              Sudah verifikasi? Masuk
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
