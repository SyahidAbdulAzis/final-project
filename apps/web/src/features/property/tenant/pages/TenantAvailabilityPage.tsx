import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantProperties, getRoomsByProperty } from '../../services/propertyApi.js';
import { AvailabilityTab } from '../components/AvailabilityTab.js';
import { SeasonalTab } from '../components/SeasonalTab.js';
import { Dropdown } from '../../../../components/common/Dropdown.js';

export function TenantAvailabilityPage() {
  const [tab, setTab] = useState<'availability' | 'seasonal'>('availability');
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantProperties()
      .then((response) => {
        const props = response.data || [];
        setProperties(props);
        if (props[0]) setSelectedProperty(props[0].id);
        else setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    setLoading(true);
    getRoomsByProperty(selectedProperty)
      .then((r) => {
        setRooms(r?.data ?? r ?? []);
        if (r?.data?.[0]) setSelectedRoom(r.data[0].id);
        else if (Array.isArray(r) && r[0]) setSelectedRoom(r[0].id);
        setLoading(false);
      })
      .catch(() => { setLoading(false); });
  }, [selectedProperty]);

  if (loading) {
    return (
      <TenantLayout>
        <div className="tenant-loading">
          <p>Memuat data...</p>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="tenant-dropdown-row">
        <div>
          <Dropdown
            label="Properti"
            value={selectedProperty}
            options={properties.map((p) => ({ value: p.id, label: p.name }))}
            onChange={(value) => setSelectedProperty(value)}
            variant="pill"
          />
        </div>
        <div>
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
        <AvailabilityTab selectedRoom={selectedRoom} />
      )}

      {tab === 'seasonal' && (
        <SeasonalTab selectedRoom={selectedRoom} />
      )}
    </TenantLayout>
  );
}
