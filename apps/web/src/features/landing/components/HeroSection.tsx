import { useAutoSlide } from '../../../hooks/useAutoSlide';

const slides = [
  {
    chip: 'Liburan & Bisnis',
    title: 'Temukan tempat nyaman untuk setiap perjalanan Anda',
    subtitle: 'Ribuan properti pilihan tersedia — liburan, bisnis, atau staycation.',
  },
  {
    chip: 'Pencarian Mudah',
    title: 'Semua kebutuhan menginap dalam satu pencarian yang cepat',
    subtitle: 'Atur destinasi, tanggal, dan jumlah tamu langsung dari navbar di atas.',
  },
  {
    chip: 'Harga Transparan',
    title: 'Harga jelas, pilihan properti relevan dan selalu diperbarui',
    subtitle: 'Bandingkan harga per malam dan temukan penawaran terbaik untukmu.',
  },
];

export function HeroSection() {
  const current = useAutoSlide(slides.length);
  const slide = slides[current];
  return (
    <section className="hero" aria-label="Hero section">
      <div className="hero-inner">
        <div className="hero-bg-blob" aria-hidden="true" />
        <div className="hero-bg-blob hero-bg-blob--2" aria-hidden="true" />
        <div className="hero-content">
          <span className="hero-chip">{slide.chip}</span>
          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>
          <div className="hero-dots">
            {slides.map((_, i) => (
              <span key={i} className={`hero-dot${i === current ? ' hero-dot--active' : ''}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
