const links = ['Beranda', 'Properti', 'Tentang', 'Bantuan'];

function Brand() {
  return <a className="brand" href="/">StayEase</a>;
}

function NavLinks() {
  return (
    <nav className="nav-links">
      {links.map((link) => <a key={link} href="/">{link}</a>)}
    </nav>
  );
}

function LoginAction() {
  return <button className="btn-outline" type="button">Masuk</button>;
}

export function Navbar() {
  return <header className="navbar"><Brand /><NavLinks /><LoginAction /></header>;
}
