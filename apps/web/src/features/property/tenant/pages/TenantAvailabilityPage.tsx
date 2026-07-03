import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantProperties, getRoomsByProperty, getAvailabilities, getSeasonalRates } from '../../services/propertyApi.js';
import { AvailabilityTab } from '../components/AvailabilityTab.js';
import { SeasonalTab } from '../components/SeasonalTab.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';

export function TenantAvailabilityPage() {
  const [tab, setTab] = useState<'availability' | 'seasonal'>('availability');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [seasonalRates, setSeasonalRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTenantProperties()
      .then((response) => {
        const props = response.data || [];
        setProperties(props);
        if (props[0]) setSelectedProperty(props[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading properties:', err);
        setError('Gagal memuat properti');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    setLoading(true);
    getRoomsByProperty(selectedProperty)
      .then((r) => {
        setRooms(r);
        if (r[0]) setSelectedRoom(r[0].id);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading rooms:', err);
        setError('Gagal memuat kamar');
        setLoading(false);
      });
  }, [selectedProperty]);

  useEffect(() => {
    if (!selectedRoom) return;
    setLoading(true);
    Promise.all([
      getAvailabilities(selectedRoom),
      getSeasonalRates(selectedRoom),
    ])
      .then(([avail, rates]) => {
        setAvailabilities(avail);
        setSeasonalRates(rates);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading availability data:', err);
        setError('Gagal memuat data ketersediaan');
        setLoading(false);
      });
  }, [selectedRoom]);

  const refresh = () => {
    if (!selectedRoom) return;
    setLoading(true);
    Promise.all([
      getAvailabilities(selectedRoom),
      getSeasonalRates(selectedRoom),
    ])
      .then(([avail, rates]) => {
        setAvailabilities(avail);
        setSeasonalRates(rates);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error refreshing data:', err);
        setError('Gagal memuat data ketersediaan');
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <TenantLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p>Memuat data...</p>
        </div>
      </TenantLayout>
    );
  }

  if (error) {
    return (
      <TenantLayout>
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#f44336' }}>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--primary)',
              background: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Reload
          </button>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ minWidth: 240, flex: 1 }}>
          <Dropdown
            label="Properti"
            value={selectedProperty}
            options={properties.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(value) => setSelectedProperty(value)}
            variant="pill"
          />
        </div>
        <div style={{ minWidth: 240, flex: 1 }}>
          <Dropdown
            label="Kamar"
            value={selectedRoom}
            options={rooms.map((r) => ({ value: r.id, label: r.name }))}
            onChange={(value) => setSelectedRoom(value)}
            variant="pill"
            disabled={rooms.length === 0}
          />
        </div>
      </div>

      <div className="tenant-tabs">
        <button className={`tenant-tab ${tab === 'availability' ? 'active' : ''}`} onClick={() => setTab('availability')}>
          Ketersediaan Kamar
        </button>
        <button className={`tenant-tab ${tab === 'seasonal' ? 'active' : ''}`} onClick={() => setTab('seasonal')}>
          Tarif Musim Ramai
        </button>
      </div>

      {tab === 'availability' && (
        <AvailabilityTab selectedRoom={selectedRoom} availabilities={availabilities} refresh={refresh} />
      )}

      {tab === 'seasonal' && (
        <SeasonalTab selectedRoom={selectedRoom} seasonalRates={seasonalRates} refresh={refresh} />
      )}
    </TenantLayout>
  );
}
