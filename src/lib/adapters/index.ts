/**
 * Adapter factory — creates and caches the active DataAdapter based on config.
 * Switching adapter type in Settings triggers a re-creation.
 */

import type { DataAdapter, AdapterConfig, AdapterType } from './types'
import { DEFAULT_ADAPTER_CONFIG } from './types'
import { MockAdapter } from './MockAdapter'
import { OpenClawAdapter } from './OpenClawAdapter'
import { GenericRESTAdapter } from './GenericRESTAdapter'

let _adapter: DataAdapter | null = null
let _currentType: AdapterType | null = null

function createAdapter(config: AdapterConfig): DataAdapter {
  switch (config.type) {
    case 'openclaw':
      return new OpenClawAdapter()
    case 'generic':
      return new GenericRESTAdapter(config.apiBaseUrl)
    case 'mock':
    default:
      return new MockAdapter()
  }
}

/** Get current adapter. Creates a MockAdapter if none exists. */
export function getAdapter(): DataAdapter {
  if (!_adapter) {
    const saved = loadConfig()
    _adapter = createAdapter(saved)
    _currentType = saved.type
  }
  return _adapter
}

/** Switch adapter type. Returns the new adapter. */
export function switchAdapter(config: AdapterConfig): DataAdapter {
  // Disconnect old adapter if it supports lifecycle
  _adapter?.disconnect?.()
  _adapter = createAdapter(config)
  _currentType = config.type
  // Persist to localStorage
  saveConfig(config)
  return _adapter
}

export function getCurrentAdapterType(): AdapterType {
  return _currentType ?? loadConfig().type
}

// --- Config persistence ---

const STORAGE_KEY = 'claw-adapter-config'

export function loadConfig(): AdapterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AdapterConfig
  } catch {
    // ignore
  }
  return DEFAULT_ADAPTER_CONFIG
}

function saveConfig(config: AdapterConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

// Re-export types
export type { DataAdapter, AdapterConfig, AdapterType } from './types'
export { DEFAULT_ADAPTER_CONFIG } from './types'
