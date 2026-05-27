import { useAutoSlide } from '../../../hooks/useAutoSlide';

const slides = [
  {
    title: 'Temukan tempat nyaman untuk setiap perjalanan liburan maupun bisnis Anda',
    subtitle: 'Pilih properti terbaik tanpa ribet.',
  },
  {
    title: 'Semua kebutuhan menginap dalam satu pencarian yang mudah dan cepat',
    subtitle: 'Atur destinasi, tanggal, dan jumlah tamu dari navbar.',
  },
  {
    title: 'Harga transparan dengan pilihan properti yang lebih relevan dan akurat',
    subtitle: 'Bandingkan listing yang tersedia sesuai kebutuhanmu.',
  },
];

export function HeroSection() {
  const current = useAutoSlide(slides.length);
  const slide = slides[current];
  return (
    <section className="hero" aria-label="Hero section">
      <div className="hero-inner">
        <div className="hero-content">
          <svg className="hero-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>
        </div>
      </div>
    </section>
  );
}
