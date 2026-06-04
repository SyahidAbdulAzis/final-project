import { useState } from 'react';
import { Navbar } from '../../../components/common/Navbar';
import { HeroSection } from '../components/HeroSection';
import { SearchForm } from '../components/SearchForm';
import { Footer } from '../../../components/common/Footer';
import { useProperties } from '../../property/hooks/useProperties';
import { PropertyList } from '../../property/components/PropertyList';
import type { PropertyQuery } from '../../../types/property';

const initialQuery: PropertyQuery = {
  city: 'Semua',
  checkIn: '',
  duration: 1,
  page: 1,
  take: 6,
  name: '',
  category: 'Semua',
  sortBy: 'name',
  order: 'asc',
};

export function LandingPage() {
  const [query, setState] = useState(initialQuery);
  const { data, meta, loading } = useProperties(query);
  const setQuery = (next: Partial<PropertyQuery>) => setState((prev) => ({ ...prev, ...next }));
  return (
    <div className="layout"><Navbar /><main><HeroSection /><SearchForm query={query} setQuery={setQuery} /><PropertyList loading={loading} items={data} meta={meta} query={query} setQuery={setQuery} /></main><Footer /></div>
  );
}
