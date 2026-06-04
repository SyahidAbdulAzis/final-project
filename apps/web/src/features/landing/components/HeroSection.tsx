import { useAutoSlide } from '../../../hooks/useAutoSlide';

const slides = [
  { title: 'Liburan Pintar', subtitle: 'Bandingkan harga properti per tanggal dengan cepat.' },
  { title: 'Booking Lebih Tenang', subtitle: 'Lihat ketersediaan room sebelum kamu tentukan jadwal.' },
  { title: 'Harga Transparan', subtitle: 'Tarif menyesuaikan momen ramai secara real-time.' },
];

export function HeroSection() {
  const current = useAutoSlide(slides.length);
  const slide = slides[current];
  return (
    <section className="hero">
      <p className="hero-badge">Promo Minggu Ini</p>
      <h1>{slide.title}</h1>
      <p>{slide.subtitle}</p>
    </section>
  );
}
