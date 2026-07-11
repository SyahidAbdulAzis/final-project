interface PropertyGalleryProps {
  images: { url: string }[];
}

export function PropertyGallery({ images }: PropertyGalleryProps) {
  return (
    <div className={`pd-gallery pd-gallery--${Math.min(images.length, 5)}`}>
      {images.slice(0, 5).map((img, i) => (
        <div key={i} className={`pd-gallery-cell pd-gallery-cell--${i}`} style={{ backgroundImage: `url(${img.url})` }} />
      ))}
      {images.length === 0 && (
        <div className="pd-gallery-cell pd-gallery-cell--0 pd-gallery-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Foto tidak tersedia</span>
        </div>
      )}
      <button type="button" className="pd-gallery-all-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Lihat semua foto
      </button>
    </div>
  );
}
