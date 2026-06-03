import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetSchema, type ResetForm } from '../validations/authSchemas.js';
import { resetPasswordApi } from '../services/authApi.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetForm) => {
    setApiError('');
    try {
      await resetPasswordApi(data.token || token, data.password);
      setSuccess(true);
      setTimeout(() => navigate('/login/user'), 2000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg || 'Reset gagal. Link mungkin sudah kadaluarsa.');
    }
  };

  return (
    <div className="layout">
      <Navbar variant="minimal" />
      <div className="auth-layout">
        <div className="auth-card">
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Buat password baru untuk akun Anda</p>

          {success && <p className="field-success api-success">Password berhasil diubah! Mengarahkan ke halaman masuk...</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            {apiError && <p className="field-error api-error">{apiError}</p>}
            {!token && <p className="field-error api-error">Link reset tidak valid. Periksa email Anda.</p>}
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
              {isSubmitting ? 'Memproses...' : 'Simpan Password'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
