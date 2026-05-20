import type { PropertyItem, PropertyMeta, PropertyQuery } from '../../../types/property';
import { formatRupiah } from '../../../lib/utils';

type Props = {
  loading: boolean;
  items: PropertyItem[];
  meta: PropertyMeta;
  query: PropertyQuery;
  setQuery: (next: Partial<PropertyQuery>) => void;
};

function Filters({ query, setQuery }: Pick<Props, 'query' | 'setQuery'>) {
  return (
    <div className="list-filters">
      <input placeholder="Filter nama" value={query.name} onChange={(e) => setQuery({ name: e.target.value, page: 1 })} />
      <select value={query.category} onChange={(e) => setQuery({ category: e.target.value, page: 1 })}>{['Semua', 'Apartment', 'Hotel', 'Guest House', 'Villa'].map((x) => <option key={x}>{x}</option>)}</select>
      <select value={query.sortBy} onChange={(e) => setQuery({ sortBy: e.target.value as PropertyQuery['sortBy'] })}><option value="name">Urut Nama</option><option value="price">Urut Harga</option></select>
      <select value={query.order} onChange={(e) => setQuery({ order: e.target.value as PropertyQuery['order'] })}><option value="asc">Asc</option><option value="desc">Desc</option></select>
    </div>
  );
}

function Card({ item }: { item: PropertyItem }) {
  return (
    <article className="card"><img src={item.imageUrl} alt={item.name} /><div><p>{item.city} • {item.category}</p><h3>{item.name}</h3><p>{formatRupiah(item.price)} / malam</p></div></article>
  );
}

function Pager({ meta, setQuery }: Pick<Props, 'meta' | 'setQuery'>) {
  return (
    <div className="pager"><button type="button" disabled={meta.page <= 1} onClick={() => setQuery({ page: meta.page - 1 })}>Prev</button><span>Hal {meta.page}/{meta.totalPages}</span><button type="button" disabled={meta.page >= meta.totalPages} onClick={() => setQuery({ page: meta.page + 1 })}>Next</button></div>
  );
}

export function PropertyList(props: Props) {
  return <section><Filters query={props.query} setQuery={props.setQuery} /><div className="property-grid">{props.loading ? <p>Memuat data...</p> : props.items.map((item) => <Card key={item.id} item={item} />)}</div><Pager meta={props.meta} setQuery={props.setQuery} /></section>;
}
