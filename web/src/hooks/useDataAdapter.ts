/**
 * useDataAdapter — generic hook for fetching data via the active adapter.
 * Returns loading/error states and exposes a refetch method.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getAdapter } from '@/lib/adapters'

interface UseDataAdapterResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDataAdapter<T>(
  fetchFn: (adapter: ReturnType<typeof getAdapter>) => Promise<T>,
  deps: unknown[] = [],
): UseDataAdapterResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const generationRef = useRef(0)

  const refetch = useCallback(async () => {
    const gen = ++generationRef.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn(getAdapter())
      if (gen === generationRef.current) {
        setData(result)
      }
    } catch (e) {
      if (gen === generationRef.current) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      }
    } finally {
      if (gen === generationRef.current) {
        setLoading(false)
      }
    }
  }, [fetchFn])

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch, ...deps])

  return { data, loading, error, refetch }
}
