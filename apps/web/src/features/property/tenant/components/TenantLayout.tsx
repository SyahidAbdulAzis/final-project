import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Navbar } from '../../../../components/common/Navbar.js';
import { Footer } from '../../../../components/common/Footer.js';

const navItems = [
  { path: '/tenant/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/tenant/properties', label: 'Properti', icon: '🏠' },
  { path: '/tenant/categories', label: 'Kategori', icon: '🏷️' },
  { path: '/tenant/rooms', label: 'Kamar', icon: '🛏️' },
  { path: '/tenant/availability', label: 'Ketersediaan', icon: '📅' },
  { path: '/tenant/reviews', label: 'Ulasan', icon: '⭐' },
];

export function TenantLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentLabel = navItems.find((n) => location.pathname.startsWith(n.path))?.label || 'Dashboard';

  return (
    <div className="layout">
      <Navbar />
      <div className="tenant-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
        <button
          type="button"
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 30,
            padding: 8,
            borderRadius: 8,
            background: '#fff',
            border: '1px solid var(--line)',
            display: 'none',
          }}
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
        <aside className="tenant-sidebar">
          <div className="tenant-sidebar-header">
            <h3>Panel Tuan Rumah</h3>
            <p>Kelola penginapan Anda</p>
          </div>
          <nav className="tenant-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `tenant-nav-item${isActive ? ' active' : ''}`}
              >
                <span className="tenant-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="tenant-main">
          <div className="tenant-page-header">
            <h1>{currentLabel}</h1>
            <p>Kelola data dengan mudah</p>
          </div>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
