import type { PropertyItem } from '../../../types/property';
import { formatRupiah } from '../../../lib/utils';

type Props = {
  loading: boolean;
  items: PropertyItem[];
};

const dummyCards = [
  {
    id: 9001,
    name: 'Vila Panorama Ubud',
    city: 'Bali',
    category: 'Vila',
    price: 1250000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
  },
  {
    id: 9002,
    name: 'Suite Menteng',
    city: 'Jakarta',
    category: 'Apartemen',
    price: 890000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
  },
  {
    id: 9003,
    name: 'Cabin Lembang',
    city: 'Bandung',
    category: 'Cabin',
    price: 760000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
  },
  {
    id: 9004,
    name: 'Studio Malioboro',
    city: 'Yogyakarta',
    category: 'Studio',
    price: 640000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
  },
  {
    id: 9005,
    name: 'Guesthouse Surabaya',
    city: 'Surabaya',
    category: 'Guesthouse',
    price: 550000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
  },
  {
    id: 9006,
    name: 'Resort Bali',
    city: 'Bali',
    category: 'Resort',
    price: 2100000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
  },
  {
    id: 9007,
    name: 'Pentagon Jakarta',
    city: 'Jakarta',
    category: 'Apartemen',
    price: 1500000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
  },
  {
    id: 9008,
    name: 'Villa Seminyak',
    city: 'Bali',
    category: 'Vila',
    price: 1800000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
  },
  {
    id: 9009,
    name: 'Cabin Ciwidey',
    city: 'Bandung',
    category: 'Cabin',
    price: 680000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
  },
  {
    id: 9010,
    name: 'Studio Kotabaru',
    city: 'Yogyakarta',
    category: 'Studio',
    price: 590000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
  },
  {
    id: 9011,
    name: 'Guesthouse Gubeng',
    city: 'Surabaya',
    category: 'Guesthouse',
    price: 620000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
  },
  {
    id: 9012,
    name: 'Resort Nusa Dua',
    city: 'Bali',
    category: 'Resort',
    price: 2800000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=900&q=80',
    rating: 4.9,
  },
  {
    id: 9013,
    name: 'Apartemen Kemang',
    city: 'Jakarta',
    category: 'Apartemen',
    price: 1200000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    rating: 4.7,
  },
  {
    id: 9014,
    name: 'Villa Canggu',
    city: 'Bali',
    category: 'Vila',
    price: 1650000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
  },
  {
    id: 9015,
    name: 'Cabin Pangalengan',
    city: 'Bandung',
    category: 'Cabin',
    price: 720000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
  },
  {
    id: 9016,
    name: 'Studio UGM',
    city: 'Yogyakarta',
    category: 'Studio',
    price: 580000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=80',
    rating: 4.5,
  },
  {
    id: 9017,
    name: 'Guesthouse Tunjungan',
    city: 'Surabaya',
    category: 'Guesthouse',
    price: 670000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=80',
    rating: 4.6,
  },
  {
    id: 9018,
    name: 'Resort Sanur',
    city: 'Bali',
    category: 'Resort',
    price: 1950000,
    description: 'Dummy properti untuk preview tampilan.',
    available: true,
    imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=900&q=80',
    rating: 4.8,
  },
];

function groupByCity(items: PropertyItem[]) {
  return items.reduce<Record<string, PropertyItem[]>>((acc, item) => {
    if (!acc[item.city]) acc[item.city] = [];
    acc[item.city].push(item);
    return acc;
  }, {});
}

function DummyCard({ item }: { item: PropertyItem }) {
  const isGuestChoice = item.rating && item.rating >= 4.8;
  return (
    <article className="card">
      <div className="card-media">
        <img src={item.imageUrl} alt={item.name} />
        {isGuestChoice && <span className="card-badge">Pilihan Tamu</span>}
        <button className="card-favorite" aria-label="Tambahkan ke Favorit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        <p className="card-location">{item.city}</p>
        <p className="card-meta">{item.category}</p>
        <p className="card-price">{formatRupiah(item.price)} / malam</p>
        {item.rating && (
          <p className="card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {item.rating}
          </p>
        )}
      </div>
    </article>
  );
}


function Availability({ item }: { item: PropertyItem }) {
  return <p className={item.available ? 'chip chip-open' : 'chip chip-closed'}>{item.available ? 'Bisa dipesan' : 'Penuh'}</p>;
}

function Card({ item }: { item: PropertyItem }) {
  const isGuestChoice = item.rating && item.rating >= 4.8;
  return (
    <article className="card">
      <div className="card-media">
        <img src={item.imageUrl} alt={item.name} />
        {isGuestChoice && <span className="card-badge">Pilihan Tamu</span>}
        <Availability item={item} />
        <button className="card-favorite" aria-label="Tambahkan ke Favorit">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <h3>{item.name}</h3>
        <p className="card-location">{item.city}</p>
        <p className="card-meta">{item.category}</p>
        <p className="card-price">{formatRupiah(item.price)} / malam</p>
        {item.rating && (
          <p className="card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {item.rating}
          </p>
        )}
      </div>
    </article>
  );
}

function CitySection({ city, items }: { city: string; items: PropertyItem[] }) {
  return (
    <section className="city-section" aria-label={`Properti ${city}`}>
      <div className="city-head">
        <h3>Tersedia di {city}</h3>
        <a href="#properti">Lihat semua</a>
      </div>
      <div className="property-grid">{items.map((item) => <Card key={item.id} item={item} />)}</div>
    </section>
  );
}

function Content({ loading, items }: Pick<Props, 'loading' | 'items'>) {
  if (loading) return null;
  if (!items.length) {
    return (
      <section className="city-section" aria-label="Dummy properti">
        <div className="city-head">
          <h3>Rekomendasi Dummy</h3>
        </div>
        <div className="property-grid">{dummyCards.map((item) => <DummyCard key={item.id} item={item} />)}</div>
      </section>
    );
  }

  const grouped = groupByCity(items);
  return (
    <div className="city-stack">
      {Object.entries(grouped).map(([city, cityItems]) => <CitySection key={city} city={city} items={cityItems} />)}
    </div>
  );
}

export function PropertyList(props: Props) {
  return (
    <section id="properti" className="listing-section">
      <Content loading={props.loading} items={props.items} />
    </section>
  );
}
