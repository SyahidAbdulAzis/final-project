import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from 'react-router-dom';
import { forgotSchema, type ForgotForm } from '../validations/authSchemas.js';
import { forgotPasswordApi } from '../services/authApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

export function ForgotPasswordPage() {
  const { role = 'user' } = useParams<{ role?: string }>();
  const [apiError, setApiError] = useState('');
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotForm) => {
    setApiError('');
    try {
      await forgotPasswordApi(data.email);
      setSent(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Gagal mengirim email. Coba lagi.');
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="layout">
      <Navbar variant="minimal" />
      <div className="auth-layout">
        <div className="auth-card">
          <div className="auth-brand-mark">
            <div className="auth-brand-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="auth-brand-name">StayEase</span>
          </div>
          <h1 className="auth-title">Lupa Password</h1>
          <p className="auth-subtitle">Kami akan kirimkan link reset ke email Anda</p>

          {sent ? (
            <p className="field-success api-success">Email reset berhasil dikirim! Periksa kotak masuk Anda.</p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              {apiError && <p className="field-error api-error">{apiError}</p>}
              <div className="field-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  {...register('email')}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="field-error">{errors.email.message}</span>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}

          <p className="auth-link">
            <a href={`/login/${role}`}>Kembali ke login</a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
