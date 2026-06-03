import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { verifySchema, type VerifyForm } from '../validations/authSchemas.js';
import { verifyApi } from '../services/authApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
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
      await verifyApi(data.token || token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login/user'), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Verifikasi gagal. Link mungkin sudah kadaluarsa.');
    }
  };

  return (
    <div className="layout">
      <Navbar variant="minimal" />
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="auth-title">Verifikasi Email</h1>
          <p className="auth-subtitle">Atur password untuk mengaktifkan akun Anda</p>

          {success && <p className="field-success api-success">Akun berhasil diaktifkan! Mengarahkan ke halaman masuk...</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {apiError && <p className="field-error api-error">{apiError}</p>}
            {!token && <p className="field-error api-error">Link verifikasi tidak valid. Periksa email Anda.</p>}
            <input type="hidden" {...register('token')} />

            <div className="field-group">
              <label htmlFor="password">Password Baru</label>
              <input
                id="password"
                type="password"
                placeholder="Minimal 8 karakter"
                {...register('password')}
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Ulangi password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'input-error' : ''}
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
