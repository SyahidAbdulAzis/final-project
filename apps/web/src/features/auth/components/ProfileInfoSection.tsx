import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileForm } from '../validations/authSchemas.js';
import { useAuth, type User } from '../stores/AuthContext.js';
import { updateProfileApi } from '../services/authApi.js';
import { icons } from './ProfileIcons.js';

interface Props {
  showSaved: (msg: string) => void;
  setError: (msg: string) => void;
}

export function ProfileInfoSection({ showSaved, setError }: Props) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = async (data: ProfileForm) => {
    setError('');
    try {
      const result = await updateProfileApi(user?.email || '', data.fullName, undefined, data.email);
      const updates: Partial<User> = {};
      if (result.fullName) updates.name = result.fullName;
      if (result.email) updates.email = result.email;
      if (result.verificationToken) updates.isVerified = false;
      updateUser(updates);
      setIsEditing(false);
      if (result.verificationToken) {
        showSaved('Email diperbarui. Silakan cek email untuk verifikasi.');
      } else {
        showSaved('Berhasil disimpan!');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Gagal menyimpan perubahan.');
    }
  };

  return (
    <section className="pw-section">
      <div className="pw-section-head">
        <h2>Informasi Pribadi</h2>
        {!isEditing && (
          <button type="button" className="pw-edit" onClick={() => setIsEditing(true)}>
            {icons.edit} Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="pw-fields">
          <div className="pw-field">
            <span className="pw-field-label">Nama Lengkap</span>
            <span className="pw-field-value">{user?.name}</span>
          </div>
          <div className="pw-field">
            <span className="pw-field-label">Email</span>
            <span className="pw-field-value">{user?.email}</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="pw-form">
          <div className="pw-form-row">
            <div className="pw-input-group">
              <label htmlFor="fullName">Nama Lengkap</label>
              <input id="fullName" type="text" {...register('fullName')} />
              {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
            </div>
          </div>
          <div className="pw-input-group full">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register('email')} className={errors.email ? 'input-error' : ''} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
            <p className="pw-hint">Jika email diubah, Anda harus verifikasi ulang.</p>
          </div>
          <div className="pw-actions">
            <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Batal</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">Simpan Perubahan</button>
          </div>
        </form>
      )}
    </section>
  );
}
