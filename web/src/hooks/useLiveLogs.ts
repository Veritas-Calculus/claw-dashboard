/**
 * useLiveLogs — provides real-time log stream.
 * In mock mode: polls adapter at interval and prepends new entries.
 * In live mode: listens to WebSocket 'log:entry' events.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { getAdapter, getCurrentAdapterType } from '@/lib/adapters'
import { useWebSocket } from './useWebSocket'
import type { LogEntry } from '@/lib/mockData'

interface UseLiveLogsOptions {
  /** Max logs to keep in memory. Default: 500 */
  maxEntries?: number
  /** Poll interval for mock mode (ms). Default: 2000 */
  pollInterval?: number
  /** Whether auto-scroll is active. Default: true */
  autoScroll?: boolean
  /** Whether the stream is enabled. Default: true */
  enabled?: boolean
}

export function useLiveLogs(options: UseLiveLogsOptions = {}) {
  const { maxEntries = 500, pollInterval = 2000, enabled = true } = options
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const { subscribe } = useWebSocket()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const generationRef = useRef(0)

  const addLogs = useCallback(
    (newLogs: LogEntry[]) => {
      if (isPaused) return
      setLogs((prev) => {
        const merged = [...newLogs, ...prev]
        return merged.slice(0, maxEntries)
      })
    },
    [isPaused, maxEntries],
  )

  // Initial load
  useEffect(() => {
    if (!enabled) return

    const gen = ++generationRef.current

    const load = async () => {
      const entries = await getAdapter().fetchLogs(100)
      if (gen === generationRef.current) {
        setLogs(entries)
      }
    }
    load()

    const adapterType = getCurrentAdapterType()

    if (adapterType === 'mock') {
      // Mock: generate a few new logs each poll cycle
      timerRef.current = setInterval(async () => {
        if (gen !== generationRef.current) return
        const batch = await getAdapter().fetchLogs(3)
        addLogs(batch)
      }, pollInterval)
    } else {
      // Live: subscribe to log events
      const unsub = subscribe('log:entry', (payload) => {
        addLogs([payload as LogEntry])
      })
      return unsub
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [enabled, pollInterval, subscribe, addLogs])

  return {
    logs,
    isPaused,
    pause: () => setIsPaused(true),
    resume: () => setIsPaused(false),
    clear: () => setLogs([]),
  }
}
