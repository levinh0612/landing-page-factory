import { useState, useCallback } from 'react';

interface PaginationMeta {
  total: number;
  totalPages: number;
}

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, totalPages: 1 });

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  return { page, limit, setPage, setLimit, resetPage, meta, setMeta };
}
