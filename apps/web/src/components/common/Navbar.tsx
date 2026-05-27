import { useEffect, useState } from 'react';
import { SearchForm } from '../../features/landing/components/SearchForm';
import type { PropertyQuery } from '../../types/property';

type Props = {
  query: PropertyQuery;
  setQuery: (next: Partial<PropertyQuery>) => void;
};

function Brand() {
  return (
    <a className="brand" href="/">
      <img src="/logo/horizontal.svg" alt="stayease" className="brand-logo" />
    </a>
  );
}

function Actions() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="nav-actions">
      <button className="host-link" type="button">Menjadi Tuan Rumah</button>
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
            <a href="#login" className="account-item">Masuk atau mendaftar</a>
            <div className="account-divider" />
            <a href="#host" className="account-item">Menjadi Tuan Rumah</a>
          </div>
        )}
      </div>
    </div>
  );
}

export function Navbar({ query, setQuery }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header id="beranda" className={scrolled ? 'navbar scrolled' : 'navbar'}>
      <div className="nav-shell glass-card">
        <Brand />
        <SearchForm query={query} setQuery={setQuery} />
        <Actions />
      </div>
    </header>
  );
}
