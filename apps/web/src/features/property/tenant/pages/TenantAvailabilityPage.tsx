import { useState, useEffect } from 'react';
import { TenantLayout } from '../components/TenantLayout.js';
import { getTenantProperties, getRoomsByProperty, getAvailabilities, getSeasonalRates } from '../../services/propertyApi.js';
import { AvailabilityTab } from '../components/AvailabilityTab.js';
import { SeasonalTab } from '../components/SeasonalTab.js';

export function TenantAvailabilityPage() {
  const [tab, setTab] = useState<'availability' | 'seasonal'>('availability');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [seasonalRates, setSeasonalRates] = useState<any[]>([]);

  useEffect(() => {
    getTenantProperties().then((props) => {
      setProperties(props);
      if (props[0]) setSelectedProperty(props[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProperty) return;
    getRoomsByProperty(selectedProperty).then((r) => {
      setRooms(r);
      if (r[0]) setSelectedRoom(r[0].id);
    }).catch(() => {});
  }, [selectedProperty]);

  useEffect(() => {
    if (!selectedRoom) return;
    getAvailabilities(selectedRoom).then(setAvailabilities).catch(() => {});
    getSeasonalRates(selectedRoom).then(setSeasonalRates).catch(() => {});
  }, [selectedRoom]);

  const refresh = () => {
    if (!selectedRoom) return;
    getAvailabilities(selectedRoom).then(setAvailabilities).catch(() => {});
    getSeasonalRates(selectedRoom).then(setSeasonalRates).catch(() => {});
  };

  return (
    <TenantLayout>
      <div className="tenant-form-group" style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
          {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
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
