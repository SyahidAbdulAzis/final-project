import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SearchForm } from '../../features/landing/components/SearchForm';
import { useAuth } from '../../features/auth/stores/AuthContext.js';
import { GuestActions, UserActions } from './NavbarMenu.js';
import type { PropertyQuery } from '../../types/property';

type Props = {
  query?: PropertyQuery;
  setQuery?: (next: Partial<PropertyQuery>) => void;
  variant?: 'full' | 'minimal';
};

function Brand() {
  return (
    <Link className="brand" to="/">
      <img src="/logo/horizontal.svg" alt="stayease" className="brand-logo" />
    </Link>
  );
}

export function Navbar({ query, setQuery, variant = 'full' }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const isMinimal = variant === 'minimal';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
