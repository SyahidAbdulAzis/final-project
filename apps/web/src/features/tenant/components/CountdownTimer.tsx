import { useState, useEffect, useRef } from 'react';

export function CountdownTimer({ expiresAt, onExpired }: { expiresAt: string; onExpired: () => void }) {
  const [timeLeft, setTimeLeft] = useState(0);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        onExpiredRef.current();
        return;
      }
      setTimeLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  const isUrgent = timeLeft < 1000 * 60 * 60 * 24;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 600,
      backgroundColor: isUrgent ? '#fff0f0' : '#f0f7ff',
      color: isUrgent ? '#e53935' : '#1976d2',
    }}>
      <span>Sisa waktu: </span>
      {days > 0 && <span>{days}h </span>}
      <span>{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}
