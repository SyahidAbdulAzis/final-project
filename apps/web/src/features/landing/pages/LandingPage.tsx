import { useState } from 'react';
import { Navbar } from '../../../components/common/Navbar';
import { HeroSection } from '../components/HeroSection';
import { Footer } from '../../../components/common/Footer';
import { useProperties } from '../../property/hooks/useProperties';
import { PropertyList } from '../../property/components/PropertyList';
import type { PropertyQuery } from '../../../types/property';

const initialQuery: PropertyQuery = {
  city: 'Semua',
  checkIn: '',
  checkOut: '',
  guests: 1,
  page: 1,
  take: 6,
};

export function LandingPage() {
  const [query, setState] = useState(initialQuery);
  const { data, loading } = useProperties(query);
  const setQuery = (next: Partial<PropertyQuery>) => setState((prev) => ({ ...prev, ...next }));

  return (
    <div className="layout">
      <Navbar query={query} setQuery={setQuery} />
      <main className="page-main">
        <HeroSection />
        <PropertyList loading={loading} items={data} />
      </main>
      <Footer />
    </div>
  );
}
