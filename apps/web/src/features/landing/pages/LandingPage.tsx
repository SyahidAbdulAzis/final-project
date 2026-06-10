import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../../components/common/Navbar';
import { HeroSection } from '../components/HeroSection';
import { Footer } from '../../../components/common/Footer';
import { useProperties } from '../../property/hooks/useProperties';
import { PropertyList } from '../../property/components/PropertyList';
import { useAuth } from '../../auth/stores/AuthContext';
import type { PropertyQuery, PropertyItem } from '../../../types/property';

const initialQuery: PropertyQuery = {
  city: 'Semua',
  checkIn: '',
  checkOut: '',
  guests: 1,
  page: 1,
  take: 18,
};

export function LandingPage() {
  const navigate = useNavigate();
  const [query, setState] = useState(initialQuery);
  const { data, loading } = useProperties(query);
  const { user } = useAuth();

  const setQuery = (next: Partial<PropertyQuery>) => {
    if (next.city || next.checkIn || next.checkOut) {
      const params = new URLSearchParams();
      if (next.city && next.city !== 'Semua') params.set('city', next.city);
      if (next.checkIn) params.set('checkIn', next.checkIn);
      if (next.checkOut) params.set('checkOut', next.checkOut);
      params.set('guests', String(next.guests || 1));
      params.set('page', String(next.page || 1));
      navigate(`/properties?${params.toString()}`);
      return;
    }
    setState((prev) => ({ ...prev, ...next }));
  };

  const handlePropertyClick = (item: PropertyItem) => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk melakukan booking');
      navigate('/login/user');
      return;
    }
    // Navigate to property detail page where user can select a room and book
    navigate(`/properties/${item.id}`);
  };

  return (
    <div className="layout">
      <Navbar query={query} setQuery={setQuery} />
      <main className="page-main">
        <HeroSection />
        <PropertyList loading={loading} items={data} onPropertyClick={handlePropertyClick} />
      </main>
      <Footer />
    </div>
  );
}
