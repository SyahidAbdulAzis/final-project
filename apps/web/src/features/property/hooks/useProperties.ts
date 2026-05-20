import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import type { PropertyItem, PropertyMeta, PropertyQuery, PropertyResponse } from '../../../types/property';

const emptyMeta: PropertyMeta = { page: 1, take: 6, total: 0, totalPages: 1 };

export function useProperties(query: PropertyQuery) {
  const [data, setData] = useState<PropertyItem[]>([]);
  const [meta, setMeta] = useState<PropertyMeta>(emptyMeta);
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => JSON.stringify(query), [query]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    apiClient.get<PropertyResponse>('/properties', { params: query }).then(({ data }) => {
      if (!active) return;
      setData(data.data);
      setMeta(data.meta);
      setLoading(false);
    }).catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [key, query]);

  return { data, meta, loading };
}
