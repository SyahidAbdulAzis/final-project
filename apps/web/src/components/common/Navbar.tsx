import { useEffect, useState } from 'react';
import { SearchForm } from '../../features/landing/components/SearchForm';
import { useAuth } from '../../features/auth/stores/AuthContext.js';
import type { PropertyQuery } from '../../types/property';

type Props = {
  query?: PropertyQuery;
  setQuery?: (next: Partial<PropertyQuery>) => void;
  variant?: 'full' | 'minimal';
};

function Brand() {
  return (
    <a className="brand" href="/">
      <img src="/logo/horizontal.svg" alt="stayease" className="brand-logo" />
    </a>
  );
}

function GuestActions() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="nav-actions">
      <a href="/register/tenant" className="host-link">Menjadi Tuan Rumah</a>
      <div className="account-dropdown">
        <button
          className="account-trigger"
          type="button"
          aria-label="Buka menu akun"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg className="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {menuOpen && (
          <div className="account-menu glass-card">
            <a href="/login/user" className="account-item">Masuk atau mendaftar</a>
            <div className="account-divider" />
            <a href="/register/tenant" className="account-item">Menjadi Tuan Rumah</a>
          </div>
        )}
      </div>
    </div>
  );
}

function UserActions() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="nav-actions">
      {user?.role === 'user' && (
        <a href="/register/tenant" className="host-link">Menjadi Tuan Rumah</a>
      )}
      <div className="account-dropdown">
        <button
          className="account-trigger profile-trigger"
          type="button"
          aria-label="Buka menu akun"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="profile-avatar" />
          ) : (
            <div className="profile-avatar">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
        </button>
        {menuOpen && (
          <div className="account-menu glass-card">
            <div className="account-header">
              <span className="account-name">{user?.name}</span>
              <span className="account-role">{user?.role === 'tenant' ? 'Tuan Rumah' : 'Penyewa'}</span>
            </div>
            <div className="account-divider" />
            <a href="/profile" className="account-item">Profil</a>
            {user?.role === 'user' && (
              <>
                <a href="/transactions" className="account-item">Cek Transaksi</a>
                <a href="/booking-history" className="account-item">Riwayat Pemesanan</a>
              </>
            )}
            {user?.role === 'tenant' && (
              <>
                <a href="/tenant/dashboard" className="account-item">Dashboard</a>
                <a href="/tenant/properties" className="account-item">Properti Saya</a>
                <a href="/tenant/categories" className="account-item">Kategori</a>
                <a href="/tenant/rooms" className="account-item">Kamar</a>
                <a href="/tenant/availability" className="account-item">Ketersediaan</a>
                <a href="/tenant/transactions" className="account-item">Manajemen Transaksi</a>
                <a href="/tenant/reports" className="account-item">Report Penjualan</a>
              </>
            )}
            <a href="/" className="account-item" onClick={(e) => { e.preventDefault(); logout(); }}>Keluar</a>
          </div>
        )}
      </div>
    </div>
  );
}

export function Navbar({ query, setQuery, variant = 'full' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMinimal = variant === 'minimal';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header id="beranda" className={scrolled ? 'navbar scrolled' : 'navbar'}>
      <div className={`nav-shell glass-card${isMinimal ? ' nav-shell--minimal' : ''}`}>
        <Brand />
        {!isMinimal && query && setQuery ? (
          <SearchForm query={query} setQuery={setQuery} />
        ) : (
          <div className="nav-spacer" />
        )}
        {isAuthenticated ? <UserActions /> : <GuestActions />}
      </div>
    </header>
  );
}

