import { useEffect, useId, useState } from 'react';

const links = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Properti', href: '#properti' },
];

type MenuProps = {
  open: boolean;
  menuId: string;
  closeMenu: () => void;
};

type ButtonProps = {
  open: boolean;
  menuId: string;
  toggleMenu: () => void;
};

function Brand() {
  return (
    <a className="brand" href="/">
      <img src="/logo/horizontal.svg" alt="stayease" className="brand-logo" />
    </a>
  );
}

function NavLinks({ activeHash }: { activeHash: string }) {
  return (
    <nav className="nav-links" aria-label="Navigasi utama">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className={activeHash === link.href ? 'is-active' : ''}
          aria-current={activeHash === link.href ? 'page' : undefined}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function AccountMenu({ open, menuId, closeMenu }: MenuProps) {
  if (!open) return null;
  return (
    <div id={menuId} className="account-menu glass-card" role="menu" aria-label="Menu akun">
      {links.map((link) => (
        <a key={link.label} href={link.href} role="menuitem" onClick={closeMenu}>{link.label}</a>
      ))}
    </div>
  );
}

function MenuButton({ open, menuId, toggleMenu }: ButtonProps) {
  return (
    <button
      className="btn-icon"
      type="button"
      aria-label="Menu akun"
      aria-controls={menuId}
      aria-expanded={open}
      onClick={toggleMenu}
    >☰</button>
  );
}

function Actions() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const closeMenu = () => setOpen(false);
  const toggleMenu = () => setOpen((prev) => !prev);
  return (
    <div className="nav-actions">
      <a href="#login" className="btn-ghost">Masuk</a>
      <MenuButton open={open} menuId={menuId} toggleMenu={toggleMenu} />
      <AccountMenu open={open} menuId={menuId} closeMenu={closeMenu} />
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeHash, setActiveHash] = useState('#beranda');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const propertiSection = document.getElementById('properti');
      if (!propertiSection) {
        setActiveHash('#beranda');
        return;
      }
      const propertiTop = propertiSection.getBoundingClientRect().top;
      setActiveHash(propertiTop <= 120 ? '#properti' : '#beranda');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header id="beranda" className={scrolled ? 'navbar scrolled' : 'navbar'}>
      <div className="nav-shell glass-card">
        <Brand />
        <NavLinks activeHash={activeHash} />
        <Actions />
      </div>
    </header>
  );
}
