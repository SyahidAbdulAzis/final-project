import { useState, useEffect, useRef } from 'react';

export function BookingTimer({ createdAt, status }: { createdAt: string; status: string }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const expiredRef = useRef(false);

  useEffect(() => {
    if (status !== 'MENUNGGU_PEMBAYARAN' && status !== 'KADALUARSA') return;

    const calc = () => {
      const oneHourInMs = 60 * 60 * 1000;
      const elapsed = Date.now() - new Date(createdAt).getTime();
      return oneHourInMs - elapsed;
    };

    setRemaining(calc());
    const interval = setInterval(() => {
      const r = calc();
      if (r <= 0 && !expiredRef.current) {
        expiredRef.current = true;
      }
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [createdAt, status]);

  if (remaining === null || status === 'KADALUARSA') return null;

  if (remaining <= 0) {
    return <span style={{ color: '#f44336', fontWeight: 600 }}>Waktu habis</span>;
  }

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return (
    <span style={{ color: '#ff9800', fontWeight: 600 }}>
      Sisa waktu: {hours > 0 ? `${hours} jam ${minutes % 60} menit` : `${minutes} menit ${seconds % 60} detik`}
    </span>
  );
}
