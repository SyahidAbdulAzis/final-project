import { useAutoSlide } from '../../../hooks/useAutoSlide';
import type { ReactNode } from 'react';

const slides = [
  {
    title: 'Tinggal Lebih Nyaman, Pesan Lebih Cepat',
    subtitle: 'Temukan properti terbaik untuk liburan, kerja remote, atau perjalanan bisnis.',
  },
  {
    title: 'Atur Rencana Perjalanan Dalam Sekali Cari',
    subtitle: 'Pilih destinasi, tanggal check-in, dan durasi secara fleksibel dari satu halaman.',
  },
  {
    title: 'Harga Harian Lebih Transparan',
    subtitle: 'Bandingkan listing properti dengan filter dan urutan yang kamu butuhkan.',
  },
];

type Props = {
  children?: ReactNode;
};

export function HeroSection({ children }: Props) {
  const current = useAutoSlide(slides.length);
  const slide = slides[current];
  return (
    <section className="hero" aria-label="Hero carousel">
      <div className="hero-inner">
        <div className="hero-content">
          <h1>{slide.title}</h1>
          <p>{slide.subtitle}</p>
        </div>
        <div className="hero-search-slot">{children}</div>
      </div>
    </section>
  );
}
