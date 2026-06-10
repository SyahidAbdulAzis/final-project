import { useState, useEffect } from 'react';
import { getTenantProperties } from '../../services/propertyApi.js';
import { TenantLayout } from '../components/TenantLayout.js';

export function TenantDashboardPage() {
  const [stats, setStats] = useState({ properties: 0, rooms: 0, activeBookings: 0, revenue: 0 });

  useEffect(() => {
    getTenantProperties()
      .then((properties) => {
        const roomCount = properties.reduce((sum: number, p: { rooms?: unknown[] }) => sum + (p.rooms?.length || 0), 0);
        setStats({
          properties: properties.length,
          rooms: roomCount,
          activeBookings: 0,
          revenue: 0,
        });
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Properti', value: stats.properties, icon: '🏠', color: 'red' },
    { label: 'Total Kamar', value: stats.rooms, icon: '🛏️', color: 'blue' },
    { label: 'Booking Aktif', value: stats.activeBookings, icon: '📋', color: 'green' },
    { label: 'Pendapatan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, icon: '💰', color: 'amber' },
  ];

  return (
    <TenantLayout>
      <div className="tenant-stats-grid">
        {cards.map((s) => (
          <div key={s.label} className="tenant-stat-card">
            <div className={`tenant-stat-icon ${s.color}`}>{s.icon}</div>
            <div className="tenant-stat-value">{s.value}</div>
            <div className="tenant-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="tenant-card">
        <div className="tenant-card-header">
          <h2>Aktivitas Terbaru</h2>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Belum ada aktivitas terbaru.</p>
      </div>
    </TenantLayout>
  );
}
