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
    {
      label: 'Total Properti', value: stats.properties, color: 'red',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      label: 'Total Kamar', value: stats.rooms, color: 'blue',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4v16"/><path d="M22 4v16"/><path d="M2 8h20"/><path d="M2 16h20"/><path d="M6 8v8"/><path d="M12 8v8"/><path d="M18 8v8"/></svg>,
    },
    {
      label: 'Booking Aktif', value: stats.activeBookings, color: 'green',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Pendapatan', value: `Rp ${stats.revenue.toLocaleString('id-ID')}`, color: 'amber',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    },
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
