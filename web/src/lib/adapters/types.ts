/**
 * Data adapter interface — abstracts the data source (mock, REST API, etc.).
 * All pages consume data through this interface, making it trivial to swap backends.
 */

import type { Agent } from '@/store/agentStore'
import type { TaskItem, LogEntry, AlertItem, DashboardMetrics } from '@/lib/mockData'

// --- Adapter Interface ---

export interface DataAdapter {
  readonly name: string

  // Agents
  fetchAgents(): Promise<Agent[]>

  // Tasks
  fetchTasks(): Promise<TaskItem[]>

  // Logs
  fetchLogs(limit?: number): Promise<LogEntry[]>

  // Alerts
  fetchAlerts(): Promise<AlertItem[]>
  acknowledgeAlert(id: string): Promise<void>

  // Dashboard
  fetchDashboardMetrics(): Promise<DashboardMetrics>

  // Lifecycle
  connect?(): void
  disconnect?(): void
}

// --- Adapter config persisted in Settings ---

export type AdapterType = 'mock' | 'openclaw' | 'generic'

export interface AdapterConfig {
  type: AdapterType
  apiBaseUrl: string
  wsUrl: string
}

export const DEFAULT_ADAPTER_CONFIG: AdapterConfig = {
  type: 'mock',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
}
