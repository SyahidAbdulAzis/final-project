import { useMemo } from 'react';
import { useAuth } from '../stores/AuthContext.js';
import { resendVerificationApi } from '../services/authApi.js';
import { uploadImage } from '../../property/services/uploadApi.js';
import { updateProfileApi } from '../services/authApi.js';
import { icons } from './ProfileIcons.js';

interface Props {
  photoPreview: string | null;
  setPhotoPreview: (v: string | null) => void;
  showSaved: (msg: string) => void;
  setError: (msg: string) => void;
  onLogout: () => void;
}

export function ProfileSidebar({ photoPreview, setPhotoPreview, showSaved, setError, onLogout }: Props) {
  const { user, updateUser } = useAuth();
  const userInitial = useMemo(() => (user?.name ? user.name.charAt(0).toUpperCase() : 'U'), [user?.name]);

  const handleResend = async () => {
    try {
      if (user?.email) await resendVerificationApi(user.email);
      showSaved('Email verifikasi telah dikirim ulang!');
    } catch { showSaved('Gagal kirim email.'); }
  };

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      setError('Ukuran foto maksimal 1MB.');
      return;
    }
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const url = await uploadImage(file);
      await updateProfileApi(user?.email || '', undefined, url);
      updateUser({ avatar: url });
      showSaved('Foto profil berhasil diperbarui!');
    } catch {
      setError('Gagal mengupload foto.');
    }
  };

  return (
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
          <h1 className="pw-user-name">{user?.name || 'Pengguna'}</h1>
        </div>
        <div className="pw-verify-row">
          {user?.isVerified ? (
            <span className="pw-verify-badge ok"><span className="pw-verify-dot ok">{icons.check}</span> Terverifikasi</span>
          ) : (
            <span className="pw-verify-badge warn"><span className="pw-verify-dot warn">{icons.alert}</span> Belum terverifikasi</span>
          )}
        </div>
        <p className="pw-user-email">{user?.email || '-'}</p>
        <div className="pw-user-badges">
          <span className={`pw-role ${user?.role}`}>{user?.role === 'tenant' ? 'Tuan Rumah' : 'Tamu'}</span>
        </div>
        {!user?.isVerified && <button type="button" className="pw-resend" onClick={handleResend}>Kirim ulang verifikasi email</button>}
        <button type="button" className="pw-logout" onClick={onLogout}>
          {icons.logout} Keluar dari Akun
        </button>
      </div>
    </aside>
  );
}
