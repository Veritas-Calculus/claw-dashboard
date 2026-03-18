/**
 * OpenClaw REST adapter — connects to the real Claw backend API.
 * Falls through to mock data on errors so the dashboard never crashes.
 */

import api from '@/lib/api'
import type { DataAdapter } from './types'
import type { Agent } from '@/store/agentStore'
import type { TaskItem, LogEntry, AlertItem, DashboardMetrics } from '@/lib/mockData'
import { MockAdapter } from './MockAdapter'

const fallback = new MockAdapter()

export class OpenClawAdapter implements DataAdapter {
  readonly name = 'OpenClaw API'

  async fetchAgents(): Promise<Agent[]> {
    try {
      const { data } = await api.get<Agent[]>('/agents')
      return data
    } catch {
      console.warn('[OpenClawAdapter] fetchAgents failed, using mock data')
      return fallback.fetchAgents()
    }
  }

  async fetchTasks(): Promise<TaskItem[]> {
    try {
      const { data } = await api.get<TaskItem[]>('/tasks')
      return data
    } catch {
      return fallback.fetchTasks()
    }
  }

  async fetchLogs(limit = 100): Promise<LogEntry[]> {
    try {
      const { data } = await api.get<LogEntry[]>('/logs', { params: { limit } })
      return data
    } catch {
      return fallback.fetchLogs(limit)
    }
  }

  async fetchAlerts(): Promise<AlertItem[]> {
    try {
      const { data } = await api.get<AlertItem[]>('/alerts')
      return data
    } catch {
      return fallback.fetchAlerts()
    }
  }

  async acknowledgeAlert(id: string): Promise<void> {
    try {
      await api.post(`/alerts/${id}/acknowledge`)
    } catch {
      await fallback.acknowledgeAlert(id)
    }
  }

  async fetchDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const { data } = await api.get<DashboardMetrics>('/dashboard/metrics')
      return data
    } catch {
      return fallback.fetchDashboardMetrics()
    }
  }
}
