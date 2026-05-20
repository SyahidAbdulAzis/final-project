import type { PropertyQuery } from '../../../types/property';

type Props = {
  query: PropertyQuery;
  setQuery: (next: Partial<PropertyQuery>) => void;
};

function CityField({ query, setQuery }: Props) {
  return (
    <label>Destinasi
      <select value={query.city} onChange={(e) => setQuery({ city: e.target.value, page: 1 })}>
        {['Semua', 'Jakarta', 'Bandung', 'Yogyakarta', 'Bali', 'Surabaya'].map((x) => <option key={x}>{x}</option>)}
      </select>
    </label>
  );
}

function DateField({ query, setQuery }: Props) {
  return <label>Tanggal<input type="date" value={query.checkIn} onChange={(e) => setQuery({ checkIn: e.target.value })} /></label>;
}

function DurationField({ query, setQuery }: Props) {
  return <label>Durasi (malam)<input min={1} max={30} type="number" value={query.duration} onChange={(e) => setQuery({ duration: Number(e.target.value) || 1 })} /></label>;
}

export function SearchForm(props: Props) {
  return <section className="search-grid"><CityField {...props} /><DateField {...props} /><DurationField {...props} /></section>;
}
