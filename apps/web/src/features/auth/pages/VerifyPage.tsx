import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifySchema, type VerifyForm } from '../validations/authSchemas.js';
import { verifyApi } from '../services/authApi.js';
import { useAuth } from '../stores/AuthContext.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { PasswordInput } from '../../../components/common/PasswordInput.js';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: VerifyForm) => {
    setApiError('');
    try {
      const result = await verifyApi(data.token || token, data.password);
      if (result?.token && result?.user) {
        const userRole = result.user.role?.toLowerCase() as 'user' | 'tenant';
        login(result.token, { ...result.user, role: userRole });
        setSuccess(true);
        setTimeout(() => navigate(userRole === 'tenant' ? '/tenant/dashboard' : '/'), 1500);
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/login/user'), 2000);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Verifikasi gagal. Link mungkin sudah kadaluarsa.');
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
          <h1 className="auth-title">Verifikasi Email</h1>
          <p className="auth-subtitle">Atur password untuk mengaktifkan akun Anda</p>

          {success && <p className="field-success api-success">Akun berhasil diaktifkan! Mengarahkan ke halaman masuk...</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {apiError && <p className="field-error api-error">{apiError}</p>}
            {!token && <p className="field-error api-error">Link verifikasi tidak valid. Periksa email Anda.</p>}
            <input type="hidden" {...register('token')} />

            <div className="field-group">
              <label htmlFor="password">Password Baru</label>
              <PasswordInput
                id="password"
                placeholder="Minimal 8 karakter"
                hasError={!!errors.password}
                {...register('password')}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <PasswordInput
                id="confirmPassword"
                placeholder="Ulangi password"
                hasError={!!errors.confirmPassword}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? 'Memproses...' : 'Aktifkan Akun'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
