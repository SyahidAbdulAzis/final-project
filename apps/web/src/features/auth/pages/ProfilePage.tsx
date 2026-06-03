import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, changePasswordSchema, type ProfileForm, type ChangePasswordForm } from '../validations/authSchemas.js';
import { useAuth, type User } from '../stores/AuthContext.js';
import { updateProfileApi, changePasswordApi, resendVerificationApi } from '../services/authApi.js';
import { icons } from '../components/ProfileIcons.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';

export function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const userInitial = useMemo(() => (user?.name ? user.name.charAt(0).toUpperCase() : 'U'), [user?.name]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.avatar || null);
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState('Berhasil disimpan!');
  const [isEditing, setIsEditing] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const showSaved = (msg = 'Berhasil disimpan!') => {
    setSavedMsg(msg); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const { register: pr, handleSubmit: hps, formState: { errors: pe, isSubmitting: pst } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  const { register: pwdr, handleSubmit: hpws, reset: pwReset, formState: { errors: pwde, isSubmitting: pwst } } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    setProfileError('');
    try {
      await updateProfileApi(user?.email || '', data.fullName, undefined);
      const updates: Partial<User> = {};
      if (data.fullName) updates.name = data.fullName;
      if (data.phone) updates.phone = data.phone;
      if (data.email && data.email !== user?.email) { updates.email = data.email; updates.isVerified = false; }
      updateUser(updates);
      setIsEditing(false);
      showSaved();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setProfileError(msg || 'Gagal menyimpan perubahan.');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    setPasswordError('');
    try {
      await changePasswordApi(user?.email || '', data.oldPassword, data.newPassword);
      pwReset();
      showSaved('Password berhasil diubah!');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setPasswordError(msg || 'Gagal mengubah password.');
    }
  };

  const handleResend = async () => {
    try {
      if (user?.email) await resendVerificationApi(user.email);
      showSaved('Email verifikasi telah dikirim ulang!');
    } catch { showSaved('Gagal kirim email.'); }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="profile-wide">
      {saved && <div className="pro-toast success">{icons.check} {savedMsg}</div>}

      <div className="pw-layout">
        {/* Left: User Card */}
        <aside className="pw-sidebar">
          <div className="pw-user-card">
            <div className="pw-avatar-block">
              <div className="pw-avatar pw-avatar--lg">
                {photoPreview ? <img src={photoPreview} alt="" /> : <div className="pw-avatar-fallback">{userInitial}</div>}
              </div>
              <label className="pw-avatar-btn" title="Tambahkan foto">
                {icons.camera}
                <span>Tambahkan</span>
                <input type="file" accept=".jpg,.jpeg,.png,.gif" hidden onChange={handlePhoto} />
              </label>
            </div>
            <div className="pw-user-name-row">
              <h1 className="pw-user-name">{user?.name}</h1>
              {user?.isVerified ? (
                <span className="pw-verify-dot ok" title="Terverifikasi">{icons.check}</span>
              ) : (
                <span className="pw-verify-dot warn" title="Belum terverifikasi">{icons.alert}</span>
              )}
            </div>
            <p className="pw-user-email">{user?.email}</p>
            <div className="pw-user-badges">
              <span className={`pw-role ${user?.role}`}>{user?.role === 'tenant' ? 'Tuan Rumah' : 'Tamu'}</span>
            </div>
            {!user?.isVerified && <button type="button" className="pw-resend" onClick={handleResend}>Kirim ulang verifikasi email</button>}
          </div>
        </aside>

        {/* Right: Content */}
        <main className="pw-main">
          {/* Informasi Pribadi */}
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
                  <span className="pw-field-label">Telepon</span>
                  <span className="pw-field-value">{user?.phone || '-'}</span>
                </div>
                <div className="pw-field">
                  <span className="pw-field-label">Email</span>
                  <span className="pw-field-value">{user?.email}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={hps(onProfileSubmit)} className="pw-form">
                {profileError && <p className="field-error api-error">{profileError}</p>}
                <div className="pw-form-row">
                  <div className="pw-input-group">
                    <label htmlFor="fullName">Nama Lengkap</label>
                    <input id="fullName" type="text" {...pr('fullName')} />
                    {pe.fullName && <span className="field-error">{pe.fullName.message}</span>}
                  </div>
                  <div className="pw-input-group">
                    <label htmlFor="phone">Telepon</label>
                    <input id="phone" type="text" {...pr('phone')} />
                    {pe.phone && <span className="field-error">{pe.phone.message}</span>}
                  </div>
                </div>
                <div className="pw-input-group full">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" {...pr('email')} className={pe.email ? 'input-error' : ''} />
                  {pe.email && <span className="field-error">{pe.email.message}</span>}
                  <p className="pw-hint">Jika email diubah, Anda harus verifikasi ulang.</p>
                </div>
                <div className="pw-actions">
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>Batal</button>
                  <button type="submit" disabled={pst} className="btn-primary">Simpan Perubahan</button>
                </div>
              </form>
            )}
          </section>

          {/* Keamanan */}
          <section className="pw-section">
            <div className="pw-section-head"><h2>Keamanan Akun</h2></div>
            <form onSubmit={hpws(onPasswordSubmit)} className="pw-form">
              {passwordError && <p className="field-error api-error">{passwordError}</p>}
              <div className="pw-form-row">
                <div className="pw-input-group">
                  <label htmlFor="oldPassword">Password Lama</label>
                  <input id="oldPassword" type="password" placeholder="Password saat ini" {...pwdr('oldPassword')} className={pwde.oldPassword ? 'input-error' : ''} />
                  {pwde.oldPassword && <span className="field-error">{pwde.oldPassword.message}</span>}
                </div>
                <div className="pw-input-group">
                  <label htmlFor="newPassword">Password Baru</label>
                  <input id="newPassword" type="password" placeholder="Minimal 8 karakter" {...pwdr('newPassword')} className={pwde.newPassword ? 'input-error' : ''} />
                  {pwde.newPassword && <span className="field-error">{pwde.newPassword.message}</span>}
                </div>
              </div>
              <div className="pw-input-group full">
                <label htmlFor="confirmNewPassword">Konfirmasi Password Baru</label>
                <input id="confirmNewPassword" type="password" placeholder="Ulangi password baru" {...pwdr('confirmNewPassword')} className={pwde.confirmNewPassword ? 'input-error' : ''} />
                {pwde.confirmNewPassword && <span className="field-error">{pwde.confirmNewPassword.message}</span>}
              </div>
              <div className="pw-actions">
                <button type="submit" disabled={pwst} className="btn-primary">{pwst ? 'Menyimpan...' : 'Ubah Password'}</button>
              </div>
            </form>
          </section>

          {/* Logout */}
          <button type="button" className="pw-logout" onClick={logout}>
            {icons.logout} Keluar dari Akun
          </button>
        </main>
      </div>
      </div>
      <Footer />
    </div>
  );
}
