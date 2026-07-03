import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { registerSchema, type RegisterForm } from '../validations/authSchemas.js';
import { registerApi } from '../services/authApi.js';
import { useAuth } from '../stores/AuthContext.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

interface RegisterPageProps {
  role?: 'user' | 'tenant';
}

export function RegisterPage({ role = 'user' }: RegisterPageProps) {
  const isTenant = role === 'tenant';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (user) {
      navigate(user.role === 'tenant' ? '/tenant/dashboard' : '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      setApiError(decodeURIComponent(errorMsg));
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role },
  });

  const onSubmit = async (data: RegisterForm) => {
    setApiError('');
    try {
      await registerApi(data.email, role);
      navigate('/check-email', { state: { email: data.email, role } });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Pendaftaran gagal. Coba lagi.');
    }
  };

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
          <h1 className="auth-title">Daftar</h1>
          <p className="auth-subtitle">
            {isTenant
              ? 'Daftar sebagai Tuan Rumah untuk mulai menerima tamu'
              : 'Buat akun untuk mulai menjelajah'}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {apiError && <p className="field-error api-error">{apiError}</p>}
            <input type="hidden" {...register('role')} value={role} />

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
              {isSubmitting ? 'Memproses...' : 'Daftar'}
            </button>
          </form>

          <p className="auth-link">
            Sudah punya akun?{' '}
            <a href={`/login/${role}`}>
              Masuk sebagai {isTenant ? 'Tuan Rumah' : 'Penyewa'}
            </a>
          </p>

          <div className="auth-divider">atau</div>

          <div className="social-btn-row">
            <button type="button" className="social-btn" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google/start/${role}?intent=register`}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Daftar dengan Google
            </button>
            <button type="button" className="social-btn" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Daftar dengan Facebook
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
