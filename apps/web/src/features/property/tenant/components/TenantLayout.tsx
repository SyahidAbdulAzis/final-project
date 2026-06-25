import { NavLink, useLocation } from 'react-router-dom';
import { Navbar } from '../../../../components/common/Navbar.js';
import { Footer } from '../../../../components/common/Footer.js';

const navItems = [
  {
    path: '/tenant/dashboard',
    label: 'Dashboard',
    sub: 'Ringkasan aktivitas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    path: '/tenant/properties',
    label: 'Properti',
    sub: 'Kelola penginapan',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path: '/tenant/categories',
    label: 'Kategori',
    sub: 'Tipe properti',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
  },
  {
    path: '/tenant/rooms',
    label: 'Kamar',
    sub: 'Jenis & harga kamar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M2 4v16"/><path d="M22 4v16"/>
        <path d="M2 8h20"/><path d="M2 16h20"/>
        <path d="M6 8v8"/><path d="M12 8v8"/><path d="M18 8v8"/>
      </svg>
    ),
  },
  {
    path: '/tenant/availability',
    label: 'Ketersediaan',
    sub: 'Jadwal & harga musim',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

export function TenantLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const current = navItems.find((n) => location.pathname.startsWith(n.path));

  return (
    <div className="layout">
      <Navbar />
      <div className="tenant-layout">
        <aside className="tenant-sidebar">
          <div className="tenant-sidebar-header">
            <div className="tenant-sidebar-brand">
              <div className="tenant-sidebar-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div>
                <h3>Panel Tuan Rumah</h3>
                <p>Kelola penginapan Anda</p>
              </div>
            </div>
          </div>
          <nav className="tenant-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `tenant-nav-item${isActive ? ' active' : ''}`}
              >
                <span className="tenant-nav-icon">{item.icon}</span>
                <span className="tenant-nav-label">
                  <span className="tenant-nav-text">{item.label}</span>
                  <span className="tenant-nav-sub">{item.sub}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="tenant-main">
          <div className="tenant-page-header">
            <div className="tenant-page-header-icon">{current?.icon}</div>
            <div>
              <h1>{current?.label || 'Dashboard'}</h1>
              <p>{current?.sub || 'Kelola data dengan mudah'}</p>
            </div>
          </div>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
