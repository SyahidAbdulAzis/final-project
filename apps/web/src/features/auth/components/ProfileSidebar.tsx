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
    const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
    if (!allowed.some((ext) => file.name.toLowerCase().endsWith(ext))) {
      setError('Format foto harus JPG, PNG, atau GIF.');
      return;
    }
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
        {/* Avatar */}
        <div className="pw-avatar-ring">
          <div className="pw-avatar pw-avatar--lg">
            {photoPreview
              ? <img src={photoPreview} alt="" />
              : <div className="pw-avatar-fallback">{userInitial}</div>
            }
          </div>
          <label className="pw-avatar-edit" title="Ganti foto profil">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            <input type="file" accept=".jpg,.jpeg,.png,.gif" hidden onChange={handlePhoto} />
          </label>
        </div>

        {/* Name & status */}
        <h1 className="pw-user-name">{user?.name || 'Pengguna'}</h1>
        <div className="pw-verify-row">
          {user?.isVerified ? (
            <span className="pw-verify-badge ok">
              <span className="pw-verify-dot ok">{icons.check}</span> Terverifikasi
            </span>
          ) : (
            <span className="pw-verify-badge warn">
              <span className="pw-verify-dot warn">{icons.alert}</span> Belum terverifikasi
            </span>
          )}
        </div>

        {/* Info rows */}
        <div className="pw-info-rows">
          <div className="pw-info-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>{user?.email || '-'}</span>
          </div>
          <div className="pw-info-row">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className={`pw-role ${user?.role}`}>{user?.role === 'tenant' ? 'Tuan Rumah' : 'Tamu'}</span>
          </div>
        </div>

        {!user?.isVerified && (
          <button type="button" className="pw-resend" onClick={handleResend}>
            Kirim ulang verifikasi email
          </button>
        )}

        <div className="pw-divider" />

        <button type="button" className="pw-logout" onClick={onLogout}>
          {icons.logout} Keluar dari Akun
        </button>
      </div>
    </aside>
  );
}
