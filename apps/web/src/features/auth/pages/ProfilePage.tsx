import { useState } from 'react';
import { useAuth } from '../stores/AuthContext.js';
import { icons } from '../components/ProfileIcons.js';
import { Navbar } from '../../../components/common/Navbar.js';
import { Footer } from '../../../components/common/Footer.js';
import { ProfileSidebar } from '../components/ProfileSidebar.js';
import { ProfileInfoSection } from '../components/ProfileInfoSection.js';
import { PasswordSection } from '../components/PasswordSection.js';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.avatar || null);
  const [saved, setSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState('Berhasil disimpan!');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const showSaved = (msg = 'Berhasil disimpan!') => {
    setSavedMsg(msg); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="prf-page">
        {saved && <div className="pro-toast success">{icons.check} {savedMsg}</div>}

        <div className="prf-banner">
          <div className="prf-banner-overlay" />
        </div>

        <div className="pw-layout">
          <ProfileSidebar
            photoPreview={photoPreview}
            setPhotoPreview={setPhotoPreview}
            showSaved={showSaved}
            setError={setProfileError}
            onLogout={logout}
          />
          <main className="pw-main">
            {profileError && <p className="field-error api-error prf-api-error">{profileError}</p>}
            <ProfileInfoSection showSaved={showSaved} setError={setProfileError} />
            <PasswordSection showSaved={showSaved} setError={setPasswordError} />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
