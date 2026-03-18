/**
 * WebSocket client with auto-reconnect and heartbeat.
 *
 * Usage:
 *   const ws = new ClawWebSocket('ws://localhost:8080/ws')
 *   ws.on('agent:status', (payload) => { ... })
 *   ws.connect()
 *   ws.disconnect()
 */

export type WSEventHandler = (payload: unknown) => void

interface WSOptions {
  /** Max reconnect delay in ms (default: 30000) */
  maxReconnectDelay?: number
  /** Initial reconnect delay in ms (default: 1000) */
  initialReconnectDelay?: number
  /** Heartbeat interval in ms (default: 30000) */
  heartbeatInterval?: number
  /** Heartbeat timeout in ms (default: 10000) */
  heartbeatTimeout?: number
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

export class ClawWebSocket {
  private url: string
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<WSEventHandler>>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectDelay: number
  private shouldReconnect = false
  private _state: ConnectionState = 'disconnected'
  private stateListeners = new Set<(state: ConnectionState) => void>()

  private opts: Required<WSOptions>

  constructor(url: string, options: WSOptions = {}) {
    this.url = url
    this.opts = {
      maxReconnectDelay: options.maxReconnectDelay ?? 30_000,
      initialReconnectDelay: options.initialReconnectDelay ?? 1_000,
      heartbeatInterval: options.heartbeatInterval ?? 30_000,
      heartbeatTimeout: options.heartbeatTimeout ?? 10_000,
    }
    this.reconnectDelay = this.opts.initialReconnectDelay
  }

  get state(): ConnectionState {
    return this._state
  }

  private setState(s: ConnectionState) {
    this._state = s
    this.stateListeners.forEach((fn) => fn(s))
  }

  onStateChange(fn: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(fn)
    return () => this.stateListeners.delete(fn)
  }

  /** Register event handler. Returns unsubscribe function. */
  on(event: string, handler: WSEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set())
    }
    this.handlers.get(event)!.add(handler)
    return () => {
      this.handlers.get(event)?.delete(handler)
    }
  }

  /** Connect to WebSocket server. */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return
    this.shouldReconnect = true
    this.setState('connecting')
    this._createConnection()
  }

  /** Gracefully disconnect. */
  disconnect() {
    this.shouldReconnect = false
    this._clearTimers()
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    this.setState('disconnected')
  }

  /** Send typed message. */
  send(event: string, payload: unknown = {}) {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ event, payload }))
  }

  // --- Private ---

  private _createConnection() {
    try {
      this.ws = new WebSocket(this.url)
    } catch {
      this._scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      this.setState('connected')
      this.reconnectDelay = this.opts.initialReconnectDelay
      this._startHeartbeat()
      this._emit('ws:connected', null)
    }

    this.ws.onclose = () => {
      this._clearTimers()
      if (this.shouldReconnect) {
        this._scheduleReconnect()
      } else {
        this.setState('disconnected')
      }
    }

    this.ws.onerror = () => {
      // onclose will fire after onerror
    }

    this.ws.onmessage = (ev) => {
      this._resetHeartbeatTimeout()
      try {
        const msg = JSON.parse(ev.data as string) as { event: string; payload: unknown }
        if (msg.event === 'pong') return
        this._emit(msg.event, msg.payload)
      } catch {
        // ignore non-JSON messages
      }
    }
  }

  private _emit(event: string, payload: unknown) {
    this.handlers.get(event)?.forEach((fn) => {
      try {
        fn(payload)
      } catch (e) {
        console.error(`[ClawWS] handler error for "${event}":`, e)
      }
    })
    // Also emit to wildcard listeners
    this.handlers.get('*')?.forEach((fn) => {
      try {
        fn({ event, payload })
      } catch (e) {
        console.error('[ClawWS] wildcard handler error:', e)
      }
    })
  }

  private _scheduleReconnect() {
    this.setState('reconnecting')
    this._emit('ws:reconnecting', { delay: this.reconnectDelay })
    this.reconnectTimer = setTimeout(() => {
      this._createConnection()
    }, this.reconnectDelay)
    // Exponential backoff with jitter
    this.reconnectDelay = Math.min(
      this.reconnectDelay * 2 + Math.random() * 500,
      this.opts.maxReconnectDelay,
    )
  }

  private _startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send('ping')
      this.heartbeatTimeoutTimer = setTimeout(() => {
        // No pong received — force reconnect
        this.ws?.close()
      }, this.opts.heartbeatTimeout)
    }, this.opts.heartbeatInterval)
  }

  private _resetHeartbeatTimeout() {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  private _clearTimers() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    if (this.heartbeatTimeoutTimer) clearTimeout(this.heartbeatTimeoutTimer)
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.heartbeatTimeoutTimer = null
  }
}

/** Singleton WebSocket instance */
let _instance: ClawWebSocket | null = null

export function getWebSocket(): ClawWebSocket {
  if (!_instance) {
    const baseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'
    const token = localStorage.getItem('claw-token')
    const url = token ? `${baseUrl}?token=${encodeURIComponent(token)}` : baseUrl
    _instance = new ClawWebSocket(url)
  }
  return _instance
}

export function resetWebSocket() {
  if (_instance) {
    _instance.disconnect()
    _instance = null
  }
}
