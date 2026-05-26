import { useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import type { PropertyQuery } from '../../../types/property';

type Props = {
  query: PropertyQuery;
  setQuery: (next: Partial<PropertyQuery>) => void;
};

type SearchDraft = Pick<PropertyQuery, 'city' | 'checkIn'> & { duration: string };
type FieldProps = {
  draft: SearchDraft;
  setDraft: (next: Partial<SearchDraft>) => void;
};

const destinations = [
  { value: 'Semua', title: 'Semua destinasi', subtitle: 'Lihat semua kota yang tersedia' },
  { value: 'Bandung', title: 'Bandung, Jawa Barat', subtitle: 'Untuk pemandangan seperti Trans Studio Bandung' },
  { value: 'Yogyakarta', title: 'Yogyakarta, Yogyakarta', subtitle: 'Karena arsitekturnya yang menakjubkan' },
  { value: 'Jakarta', title: 'Jakarta Selatan, Jakarta', subtitle: 'Di dekat Anda' },
  { value: 'Surabaya', title: 'Surabaya, Jawa Timur', subtitle: 'Pilihan kota bisnis yang strategis' },
  { value: 'Bali', title: 'Kuta, Bali', subtitle: 'Destinasi pantai populer' },
];

function CityField({ draft, setDraft }: FieldProps) {
  const [open, setOpen] = useState(false);
  const selected = destinations.find((item) => item.value === draft.city) ?? destinations[0];
  const onPillClick = (e: MouseEvent<HTMLLabelElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.city-options') || target.closest('.city-select-trigger')) return;
    setOpen(true);
  };
  const closeOnBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
  };
  const chooseCity = (city: string) => {
    setDraft({ city });
    setOpen(false);
  };

  return (
    <label className="field search-pill" onClick={onPillClick}>
      <span className="pill-title">Destinasi</span>
      <div className="city-select" onBlur={closeOnBlur}>
        <button className="city-select-trigger" type="button" onClick={() => setOpen((prev) => !prev)} aria-expanded={open} aria-label="Pilih destinasi">
          <span>{selected.value}</span>
          <span className={open ? 'city-chevron open' : 'city-chevron'}>{open ? '⌃' : '⌄'}</span>
        </button>
        {open && (
          <ul className="city-options glass-card" role="listbox" aria-label="Destinasi yang disarankan">
            <li className="city-options-head">Destinasi yang disarankan</li>
            {destinations.map((item) => (
              <li key={item.value}>
                <button className={item.value === draft.city ? 'city-option active' : 'city-option'} type="button" onClick={() => chooseCity(item.value)}>
                  <span className="city-option-title">{item.title}</span>
                  <span className="city-option-subtitle">{item.subtitle}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </label>
  );
}

function DateField({ draft, setDraft }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onPillClick = (e: MouseEvent<HTMLLabelElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    inputRef.current?.focus();
    if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker();
  };

  return (
    <label className="field search-pill" onClick={onPillClick}>
      <span className="pill-title">Check-in</span>
      <input ref={inputRef} type="date" value={draft.checkIn} onChange={(e) => setDraft({ checkIn: e.target.value })} />
    </label>
  );
}

function DurationField({ draft, setDraft }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizeDuration = () => {
    const next = Number(draft.duration);
    if (!Number.isFinite(next) || next < 1) return setDraft({ duration: '1' });
    if (next > 30) return setDraft({ duration: '30' });
    setDraft({ duration: String(next) });
  };

  const onPillClick = (e: MouseEvent<HTMLLabelElement>) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return;
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <label className="field search-pill" onClick={onPillClick}>
      <span className="pill-title">Durasi</span>
      <span className="duration-inline">
        <input
          ref={inputRef}
          className="duration-input"
          min={1}
          max={30}
          type="number"
          value={draft.duration}
          onBlur={normalizeDuration}
          onChange={(e) => setDraft({ duration: e.target.value })}
        />
        <span className="unit">hari</span>
      </span>
    </label>
  );
}

function SearchButton({ onSearch }: { onSearch: () => void }) {
  return (
    <button className="search-cta" type="button" onClick={onSearch} aria-label="Cari properti">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </button>
  );
}

export function SearchForm({ query, setQuery }: Props) {
  const [draft, setState] = useState<SearchDraft>({ city: query.city, checkIn: query.checkIn, duration: String(query.duration) });
  const setDraft = (next: Partial<SearchDraft>) => setState((prev) => ({ ...prev, ...next }));
  const onSearch = () => {
    const parsed = Number(draft.duration);
    const duration = Number.isFinite(parsed) && parsed >= 1 && parsed <= 30 ? parsed : 1;
    setState((prev) => ({ ...prev, duration: String(duration) }));
    setQuery({ city: draft.city, checkIn: draft.checkIn, duration, page: 1 });
  };
  return (
    <section className="search-wrap" aria-label="Form pencarian properti">
      <div className="search-grid glass-card search-shell">
        <CityField draft={draft} setDraft={setDraft} />
        <DateField draft={draft} setDraft={setDraft} />
        <DurationField draft={draft} setDraft={setDraft} />
        <SearchButton onSearch={onSearch} />
      </div>
    </section>
  );
}
