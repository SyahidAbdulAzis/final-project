import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loginSchema, type LoginForm } from '../validations/authSchemas.js';
import { useAuth } from '../stores/AuthContext.js';
import { loginApi, getProfileApi } from '../services/authApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { PasswordInput } from '../../../components/common/PasswordInput.js';
import type { User } from '../stores/AuthContext.js';

interface LoginPageProps {
  role?: 'user' | 'tenant';
}

function mapBackendUser(raw: any, fallbackRole: 'user' | 'tenant' = 'user'): User {
  return {
    id: raw.id ?? '',
    name: raw.fullName ?? raw.name ?? '',
    email: raw.email ?? '',
    role: (raw.role?.toLowerCase() ?? fallbackRole) as 'user' | 'tenant',
    avatar: raw.photoUrl ?? raw.avatar ?? undefined,
    isVerified: raw.isVerified ?? false,
  };
}

export function LoginPage({ role = 'user' }: LoginPageProps) {
  const isTenant = role === 'tenant';
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [apiError, setApiError] = useState('');
  const [redirectMsg] = useState(() => {
    const msg = sessionStorage.getItem('authRedirectMsg') || '';
    sessionStorage.removeItem('authRedirectMsg');
    return msg;
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && !user) {
      const email = searchParams.get('email') || '';
      login(token, { id: '', name: '', email, role, isVerified: true });
      getProfileApi(email)
        .then((profile) => {
          login(token, mapBackendUser(profile, role));
          navigate(role === 'tenant' ? '/tenant/dashboard' : '/');
        })
        .catch(() => navigate('/'));
    }
  }, [searchParams, user, login, navigate, role]);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'tenant' ? '/tenant/dashboard' : '/');
    }
  }, [user, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setApiError('');
    try {
      const response = await loginApi(data.email, data.password, role);
      const { token, user } = response;
      login(token, mapBackendUser(user, role));
      navigate(role === 'tenant' ? '/tenant/dashboard' : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Email atau password salah');
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
          <h1 className="auth-title">Masuk</h1>
          <p className="auth-subtitle">
          {isTenant ? 'Selamat datang kembali, Tuan Rumah' : 'Selamat datang kembali'}
        </p>

        {redirectMsg && <p className="field-error api-error">{redirectMsg}</p>}

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

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              hasError={!!errors.password}
              {...register('password')}
            />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
          </div>

          <a href={`/forgot-password/${role}`} className="auth-forgot">
            Lupa password?
          </a>

          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="auth-link">
          Belum punya akun?{' '}
          <a href={`/register/${role}`}>
            Daftar sebagai {isTenant ? 'Tuan Rumah' : 'Penyewa'}
          </a>
        </p>

        <div className="auth-divider">atau</div>

        <div className="social-btn-row">
          <button type="button" className="social-btn" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/google/start/${role}`}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Masuk dengan Google
          </button>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
