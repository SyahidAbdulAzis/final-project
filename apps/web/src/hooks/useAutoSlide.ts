import { useEffect, useState } from 'react';

export function useAutoSlide(total: number, delay = 4000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (total <= 1) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % total), delay);
    return () => window.clearInterval(id);
  }, [delay, total]);

  return index;
}
