import { useRef, useState, useEffect, type ChangeEvent, type FocusEvent, type MouseEvent } from 'react';
import type { PropertyQuery } from '../../../types/property';
type Props = { query: PropertyQuery; setQuery: (next: Partial<PropertyQuery>) => void };
type SearchDraft = Pick<PropertyQuery, 'city' | 'checkIn' | 'checkOut'> & { guests: string };
type FieldProps = { draft: SearchDraft; setDraft: (next: Partial<SearchDraft>) => void };
const destinations = [{ value: 'Semua', title: 'Semua destinasi', subtitle: 'Lihat semua kota yang tersedia' }, { value: 'Bandung', title: 'Bandung, Jawa Barat', subtitle: 'Untuk pemandangan seperti Trans Studio Bandung' }, { value: 'Yogyakarta', title: 'Yogyakarta, Yogyakarta', subtitle: 'Karena arsitekturnya yang menakjubkan' }, { value: 'Jakarta', title: 'Jakarta Selatan, Jakarta', subtitle: 'Di dekat Anda' }, { value: 'Surabaya', title: 'Surabaya, Jawa Timur', subtitle: 'Pilihan kota bisnis yang strategis' }, { value: 'Bali', title: 'Kuta, Bali', subtitle: 'Destinasi pantai populer' }];
const today = new Date().toISOString().split('T')[0];
function formatShortDate(value: string) { if (!value) return ''; const [year, month, day] = value.split('-').map(Number); if (!year || !month || !day) return ''; return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(year, month - 1, day)); }

function CityField({ draft, setDraft }: FieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = destinations.find((item) => item.value === draft.city) ?? destinations[0];
  const toggleDropdown = () => setOpen((prev) => !prev);
  const chooseCity = (city: string) => { setDraft({ city }); setOpen(false); };
  useEffect(() => {
    const handleClickOutside = (e: Event) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="field search-pill pill-first" ref={containerRef}>
      <span className="pill-title">Destinasi</span>
      <div className="city-select">
        <button className="city-select-trigger" type="button" onClick={toggleDropdown} aria-expanded={open} aria-label="Pilih destinasi"><span>{selected.value}</span><span className={open ? 'city-chevron open' : 'city-chevron'}>{open ? '⌃' : '⌄'}</span></button>
        {open && (
          <ul className="city-options glass-card" role="listbox" aria-label="Destinasi yang disarankan">
            <li className="city-options-head">Destinasi yang disarankan</li>
            {destinations.map((item) => (
              <li key={item.value}>
                <button className={item.value === draft.city ? 'city-option active' : 'city-option'} type="button" onClick={() => chooseCity(item.value)}><span className="city-option-title">{item.title}</span><span className="city-option-subtitle">{item.subtitle}</span></button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DateField({ draft, setDraft }: FieldProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const togglePopover = () => { setOpen((prev) => !prev); checkInRef.current?.focus(); if (typeof checkInRef.current?.showPicker === 'function') checkInRef.current.showPicker(); };
  const handleCheckInChange = (e: ChangeEvent<HTMLInputElement>) => { const newCheckIn = e.target.value; setDraft({ checkIn: newCheckIn }); if (newCheckIn && draft.checkOut && new Date(newCheckIn) >= new Date(draft.checkOut)) { const nextDay = new Date(newCheckIn); nextDay.setDate(nextDay.getDate() + 1); setDraft({ checkOut: nextDay.toISOString().split('T')[0] }); } };
  const handleCheckOutChange = (e: ChangeEvent<HTMLInputElement>) => { const nextCheckOut = e.target.value; if (!draft.checkIn || !nextCheckOut || new Date(nextCheckOut) > new Date(draft.checkIn)) { setDraft({ checkOut: nextCheckOut }); return; } setDraft({ checkOut: '' }); };
  const dateLabel = draft.checkIn && draft.checkOut ? `${formatShortDate(draft.checkIn)} - ${formatShortDate(draft.checkOut)}` : 'Tambahkan tanggal';
  useEffect(() => {
    const handleClickOutside = (e: Event) => { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="field search-pill pill-middle date-picker-wrap" ref={containerRef}>
      <span className="pill-title">Tanggal</span>
      <span className={draft.checkIn && draft.checkOut ? 'date-trigger has-value' : 'date-trigger'} onClick={togglePopover}>{dateLabel}</span>
      {open && (
        <div className="date-popover glass-card" role="dialog" aria-label="Pilih rentang tanggal">
          <label className="date-input-field"><span>Check-in</span><input ref={checkInRef} type="date" value={draft.checkIn} onChange={handleCheckInChange} min={today} /></label>
          <label className="date-input-field"><span>Check-out</span><input type="date" value={draft.checkOut} onChange={handleCheckOutChange} min={draft.checkIn || today} /></label>
        </div>
      )}
    </div>
  );
}

function GuestsField({ draft, setDraft }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const normalizeGuests = () => { const next = Number(draft.guests); if (!Number.isFinite(next) || next < 1) return setDraft({ guests: '1' }); if (next > 16) return setDraft({ guests: '16' }); setDraft({ guests: String(next) }); };
  const onPillClick = (e: MouseEvent<HTMLLabelElement>) => { if ((e.target as HTMLElement).tagName === 'INPUT') return; inputRef.current?.focus(); inputRef.current?.select(); };
  return (
    <label className="field search-pill pill-last" onClick={onPillClick}>
      <span className="pill-title">Jumlah Orang</span>
      <span className="duration-inline">
        <input ref={inputRef} className="duration-input" min={1} max={16} type="number" value={draft.guests} onBlur={normalizeGuests} onChange={(e) => setDraft({ guests: e.target.value })} />
        <span className="unit">orang</span>
      </span>
    </label>
  );
}

function SearchButton({ onSearch }: { onSearch: () => void }) { return <button className="search-cta" type="button" onClick={onSearch} aria-label="Cari properti"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg></button>; }

export function SearchForm({ query, setQuery }: Props) {
  const [draft, setState] = useState<SearchDraft>({ city: query.city, checkIn: query.checkIn, checkOut: query.checkOut, guests: String(query.guests || 1) });
  const setDraft = (next: Partial<SearchDraft>) => setState((prev) => ({ ...prev, ...next }));
  const onSearch = () => { const parsedGuests = Number(draft.guests); const guests = Number.isFinite(parsedGuests) && parsedGuests >= 1 ? parsedGuests : 1; setState((prev) => ({ ...prev, guests: String(guests) })); setQuery({ city: draft.city, checkIn: draft.checkIn, checkOut: draft.checkOut, guests, page: 1 }); };
  return (
    <section className="search-wrap" aria-label="Form pencarian properti">
      <div className="search-grid glass-card search-shell">
        <CityField draft={draft} setDraft={setDraft} />
        <DateField draft={draft} setDraft={setDraft} />
        <GuestsField draft={draft} setDraft={setDraft} />
        <SearchButton onSearch={onSearch} />
      </div>
    </section>
  );
}
