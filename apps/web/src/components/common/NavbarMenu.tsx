import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/stores/AuthContext.js';

function MenuIcon({ path }: { path: string }) {
  return (
    <svg className="menu-item-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export function GuestActions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <div className="nav-actions">
      <Link to="/register/tenant" className="host-link">Menjadi Tuan Rumah</Link>
      <div className="account-dropdown">
        <button className="account-trigger" type="button" aria-label="Buka menu navigasi" aria-expanded={menuOpen} onClick={() => setMenuOpen((p) => !p)}>
          <svg className="menu-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        {menuOpen && (
          <div className="account-menu glass-card">
            <p className="menu-section-label">Masuk</p>
            <Link to="/login/user" className="account-item" onClick={close}><MenuIcon path="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />Masuk sebagai Penyewa</Link>
            <Link to="/login/tenant" className="account-item" onClick={close}><MenuIcon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />Masuk sebagai Tuan Rumah</Link>
            <div className="account-divider" />
            <p className="menu-section-label">Daftar</p>
            <Link to="/register/user" className="account-item" onClick={close}><MenuIcon path="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />Daftar sebagai Penyewa</Link>
            <Link to="/register/tenant" className="account-item" onClick={close}><MenuIcon path="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />Menjadi Tuan Rumah</Link>
            <div className="account-divider" />
            <p className="menu-section-label">Jelajahi</p>
            <Link to="/properties" className="account-item" onClick={close}><MenuIcon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />Katalog Properti</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function UserActions() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const close = () => setMenuOpen(false);

  return (
    <div className="nav-actions">
      {user?.role === 'user' && <a href="/register/tenant" className="host-link">Menjadi Tuan Rumah</a>}
      <div className="account-dropdown">
        <button className="account-trigger profile-trigger" type="button" aria-label="Buka menu akun" aria-expanded={menuOpen} onClick={() => setMenuOpen((p) => !p)}>
          {user?.avatar ? <img src={user.avatar} alt="" className="profile-avatar" /> : (
            <div className="profile-avatar"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div>
          )}
        </button>
        {menuOpen && (
          <div className="account-menu glass-card">
            <div className="account-header"><span className="account-name">{user?.name}</span><span className="account-role">{user?.role === 'tenant' ? 'Tuan Rumah' : 'Penyewa'}</span></div>
            <div className="account-divider" />
            {user?.role === 'user' && (
              <>
                <p className="menu-section-label">Akun</p>
                <Link to="/profile" className="account-item" onClick={close}><MenuIcon path="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm5-1h5M13 13h3" />Profil Saya</Link>
                <div className="account-divider" /><p className="menu-section-label">Jelajahi</p>
                <Link to="/properties" className="account-item" onClick={close}><MenuIcon path="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />Katalog Properti</Link>
                <div className="account-divider" /><p className="menu-section-label">Pemesanan</p>
                <Link to="/transactions" className="account-item" onClick={close}><MenuIcon path="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />Cek Transaksi</Link>
                <Link to="/booking-history" className="account-item" onClick={close}><MenuIcon path="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />Riwayat Pemesanan</Link>
              </>
            )}
            {user?.role === 'tenant' && (
              <>
                <p className="menu-section-label">Akun</p>
                <Link to="/profile" className="account-item" onClick={close}><MenuIcon path="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm5-1h5M13 13h3" />Profil Saya</Link>
                <div className="account-divider" /><p className="menu-section-label">Kelola Properti</p>
                <Link to="/tenant/dashboard" className="account-item" onClick={close}><MenuIcon path="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />Dashboard</Link>
                <Link to="/tenant/properties" className="account-item" onClick={close}><MenuIcon path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />Properti Saya</Link>
                <Link to="/tenant/categories" className="account-item" onClick={close}><MenuIcon path="M4 6h16M4 10h16M4 14h16M4 18h16" />Kategori</Link>
                <Link to="/tenant/rooms" className="account-item" onClick={close}><MenuIcon path="M1 4h22v16H1zM8 4v16" />Kamar</Link>
                <Link to="/tenant/availability" className="account-item" onClick={close}><MenuIcon path="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />Ketersediaan</Link>
                <Link to="/tenant/reviews" className="account-item" onClick={close}><MenuIcon path="M8 12h.01M3 12h.01M3 18h.01" />Ulasan</Link>
                <div className="account-divider" /><p className="menu-section-label">Bisnis</p>
                <Link to="/tenant/transactions" className="account-item" onClick={close}><MenuIcon path="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />Manajemen Transaksi</Link>
                <Link to="/tenant/reports" className="account-item" onClick={close}><MenuIcon path="M18 20V10M12 20V4M6 20v-6" />Report Penjualan</Link>
              </>
            )}
            <div className="account-divider" />
            <button type="button" className="account-item account-item--danger" onClick={() => { close(); logout(); }}>
              <MenuIcon path="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
