/**
 * useWebSocket — React hook for ClawWebSocket lifecycle management.
 * Connects WebSocket on mount, disconnects on unmount.
 * Exposes connection state and a method to subscribe to events.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getWebSocket, type ConnectionState, type WSEventHandler } from '@/lib/ws'

export function useWebSocket() {
  const [state, setState] = useState<ConnectionState>('disconnected')
  const wsRef = useRef(getWebSocket())

  useEffect(() => {
    const ws = wsRef.current
    const unsub = ws.onStateChange(setState)
    ws.connect()
    return () => {
      unsub()
      // Don't disconnect here — singleton reused across components
    }
  }, [])

  const subscribe = useCallback((event: string, handler: WSEventHandler) => {
    return wsRef.current.on(event, handler)
  }, [])

  const send = useCallback((event: string, payload?: unknown) => {
    wsRef.current.send(event, payload)
  }, [])

  return {
    state,
    subscribe,
    send,
    ws: wsRef.current,
  }
}
