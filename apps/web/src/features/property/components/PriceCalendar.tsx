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
  onSelect: (date: string) => void;
  selectedDate?: string;
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
  const date = new Date(dateStr);
  const rate = rates.find((r) => {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return date >= start && date <= end;
  });
  if (!rate) return basePrice;
  return rate.adjustmentType === 'PERCENTAGE'
    ? Math.round(basePrice * (1 + rate.adjustmentValue / 100))
    : basePrice + rate.adjustmentValue;
}

export function PriceCalendar({ basePrice, seasonalRates, onSelect, selectedDate }: Props) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const cells: { day: number; price: number; key: string }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, price: 0, key: `pad-${i}` });
    for (let d = 1; d <= totalDays; d++) {
      const key = formatDateKey(viewYear, viewMonth, d);
      const price = getPriceForDate(basePrice, key, seasonalRates);
      cells.push({ day: d, price, key });
    }
    return cells;
  }, [viewYear, viewMonth, basePrice, seasonalRates]);

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
        <button type="button" className="pc-nav" onClick={prevMonth}>{'<'}</button>
        <span className="pc-title">{monthNames[viewMonth]} {viewYear}</span>
        <button type="button" className="pc-nav" onClick={nextMonth}>{'>'}</button>
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
              className={`pc-cell${selectedDate === cell.key ? ' pc-cell--selected' : ''}`}
              onClick={() => onSelect(cell.key)}
            >
              <span className="pc-date">{cell.day}</span>
              <span className="pc-price">Rp {(cell.price / 1000).toFixed(0)}k</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}
