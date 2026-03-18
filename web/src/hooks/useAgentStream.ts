/**
 * useAgentStream — subscribes to real-time agent status updates.
 * In mock mode: polls the adapter every interval.
 * In live mode: listens to WebSocket 'agent:status' events.
 */

import { useEffect, useRef, useCallback } from 'react'
import { useAgentStore } from '@/store'
import { getAdapter, getCurrentAdapterType } from '@/lib/adapters'
import { useWebSocket } from './useWebSocket'
import type { Agent } from '@/store/agentStore'

interface UseAgentStreamOptions {
  /** Polling interval in ms (only used when adapter is mock). Default: 3000 */
  pollInterval?: number
  /** Whether to enable the stream. Default: true */
  enabled?: boolean
}

export function useAgentStream(options: UseAgentStreamOptions = {}) {
  const { pollInterval = 3000, enabled = true } = options
  const { setAgents, updateAgent } = useAgentStore()
  const { subscribe } = useWebSocket()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initial load
  const loadAgents = useCallback(async () => {
    try {
      const agents = await getAdapter().fetchAgents()
      setAgents(agents)
    } catch (e) {
      console.error('[useAgentStream] Error loading agents:', e)
    }
  }, [setAgents])

  useEffect(() => {
    if (!enabled) return

    // Load immediately
    loadAgents()

    const adapterType = getCurrentAdapterType()

    if (adapterType === 'mock') {
      // Polling mode for mock adapter
      timerRef.current = setInterval(loadAgents, pollInterval)
    } else {
      // WebSocket mode for live adapters
      const unsub = subscribe('agent:status', (payload) => {
        const update = payload as { id: string } & Partial<Agent>
        updateAgent(update.id, update)
      })
      return unsub
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [enabled, pollInterval, loadAgents, subscribe, updateAgent])

  return { reload: loadAgents }
}
