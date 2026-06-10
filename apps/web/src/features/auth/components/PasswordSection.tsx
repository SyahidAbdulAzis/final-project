import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordForm } from '../validations/authSchemas.js';
import { useAuth } from '../stores/AuthContext.js';
import { changePasswordApi } from '../services/authApi.js';

interface Props {
  showSaved: (msg: string) => void;
  setError: (msg: string) => void;
}

export function PasswordSection({ showSaved, setError }: Props) {
  const { user } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordForm) => {
    setError('');
    try {
      await changePasswordApi(user?.email || '', data.oldPassword, data.newPassword);
      reset();
      showSaved('Password berhasil diubah!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Gagal mengubah password.');
    }
  };

  return (
    <section className="pw-section">
      <div className="pw-section-head"><h2>Keamanan Akun</h2></div>
      <form onSubmit={handleSubmit(onSubmit)} className="pw-form">
        <div className="pw-form-row">
          <div className="pw-input-group">
            <label htmlFor="oldPassword">Password Lama</label>
            <input id="oldPassword" type="password" placeholder="Password saat ini" {...register('oldPassword')} className={errors.oldPassword ? 'input-error' : ''} />
            {errors.oldPassword && <span className="field-error">{errors.oldPassword.message}</span>}
          </div>
          <div className="pw-input-group">
            <label htmlFor="newPassword">Password Baru</label>
            <input id="newPassword" type="password" placeholder="Minimal 8 karakter" {...register('newPassword')} className={errors.newPassword ? 'input-error' : ''} />
            {errors.newPassword && <span className="field-error">{errors.newPassword.message}</span>}
          </div>
        </div>
        <div className="pw-input-group full">
          <label htmlFor="confirmNewPassword">Konfirmasi Password Baru</label>
          <input id="confirmNewPassword" type="password" placeholder="Ulangi password baru" {...register('confirmNewPassword')} className={errors.confirmNewPassword ? 'input-error' : ''} />
          {errors.confirmNewPassword && <span className="field-error">{errors.confirmNewPassword.message}</span>}
        </div>
        <div className="pw-actions">
          <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Ubah Password'}</button>
        </div>
      </form>
    </section>
  );
}
