import { useState, useMemo } from 'react';

interface SeasonalRate {
  name: string;
  startDate: string;
  endDate: string;
  adjustmentType: string;
  adjustmentValue: number;
}

interface Props {
  basePrice: number;
  seasonalRates: SeasonalRate[];
  availabilityMap?: Record<string, boolean>;
  onSelect: (date: string) => void;
  selectedDate?: string;
  checkOutDate?: string;
  offsetMonths?: number;
  minDate?: string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPriceForDate(basePrice: number, dateStr: string, rates: SeasonalRate[]) {
  const dateKey = dateStr.slice(0, 10);
  const rate = rates.find((r) => {
    const startKey = r.startDate.slice(0, 10);
    const endKey = r.endDate.slice(0, 10);
    return dateKey >= startKey && dateKey <= endKey;
  });
  if (!rate) return basePrice;
  return rate.adjustmentType === 'PERCENTAGE'
    ? Math.round(basePrice * (1 + rate.adjustmentValue / 100))
    : basePrice + rate.adjustmentValue;
}

function isBetween(dateStr: string, startStr: string, endStr: string) {
  if (!startStr || !endStr) return false;
  const date = new Date(dateStr).getTime();
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  return date >= start && date <= end;
}

export function PriceCalendar({ basePrice, seasonalRates, availabilityMap, onSelect, selectedDate, checkOutDate, offsetMonths = 0, minDate }: Props) {
  const today = new Date();
  const baseMonth = today.getMonth() + offsetMonths;
  const baseYear = today.getFullYear() + Math.floor(baseMonth / 12);
  const initialMonth = ((baseMonth % 12) + 12) % 12;

  const [viewMonth, setViewMonth] = useState(initialMonth);
  const [viewYear, setViewYear] = useState(baseYear);

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const minDateKey = minDate || formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: { day: number; price: number; key: string; isInRange: boolean; disabled: boolean; isUnavailable: boolean }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, price: 0, key: `pad-${i}`, isInRange: false, disabled: false, isUnavailable: false });
    for (let d = 1; d <= totalDays; d++) {
      const key = formatDateKey(viewYear, viewMonth, d);
      const price = getPriceForDate(basePrice, key, seasonalRates);
      const isInRange = selectedDate && checkOutDate ? isBetween(key, selectedDate, checkOutDate) : false;
      const isPast = key < minDateKey;
      const isUnavailable = availabilityMap ? availabilityMap[key] === false : false;
      cells.push({ day: d, price, key, isInRange, disabled: isPast || isUnavailable, isUnavailable });
    }
    return cells;
  }, [viewYear, viewMonth, basePrice, seasonalRates, selectedDate, checkOutDate, availabilityMap, minDateKey]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="price-calendar">
      <div className="pc-header">
        <button type="button" className="pc-nav" onClick={prevMonth} aria-label="Bulan sebelumnya">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span className="pc-title">{monthNames[viewMonth]} {viewYear}</span>
        <button type="button" className="pc-nav" onClick={nextMonth} aria-label="Bulan berikutnya">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
      <div className="pc-grid">
        {dayNames.map((d) => <div key={d} className="pc-day-label">{d}</div>)}
        {days.map((cell) =>
          cell.day === 0 ? (
            <div key={cell.key} className="pc-cell pc-cell--pad" />
          ) : (
            <button
              key={cell.key}
              type="button"
              disabled={cell.disabled}
              className={`pc-cell${selectedDate === cell.key ? ' pc-cell--selected' : ''}${cell.isInRange ? ' pc-cell--range' : ''}${cell.disabled ? ' pc-cell--disabled' : ''}${cell.isUnavailable ? ' pc-cell--unavailable' : ''}`}
              onClick={() => onSelect(cell.key)}
            >
              <span className="pc-date">{cell.day}</span>
              <span className="pc-price">{cell.isUnavailable ? 'Penuh' : `Rp ${(cell.price / 1000).toFixed(0)}k`}</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
