/**
 * Generic REST adapter — configurable base URL for any compatible REST API.
 * Expects endpoints at /agents, /tasks, /logs, /alerts, /dashboard/metrics.
 */

import axios from 'axios'
import type { DataAdapter } from './types'
import type { Agent } from '@/store/agentStore'
import type { TaskItem, LogEntry, AlertItem, DashboardMetrics } from '@/lib/mockData'
import { MockAdapter } from './MockAdapter'

const fallback = new MockAdapter()

export class GenericRESTAdapter implements DataAdapter {
  readonly name = 'Generic REST'
  private client

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  async fetchAgents(): Promise<Agent[]> {
    try {
      const { data } = await this.client.get<Agent[]>('/agents')
      return data
    } catch {
      return fallback.fetchAgents()
    }
  }

  async fetchTasks(): Promise<TaskItem[]> {
    try {
      const { data } = await this.client.get<TaskItem[]>('/tasks')
      return data
    } catch {
      return fallback.fetchTasks()
    }
  }

  async fetchLogs(limit = 100): Promise<LogEntry[]> {
    try {
      const { data } = await this.client.get<LogEntry[]>('/logs', { params: { limit } })
      return data
    } catch {
      return fallback.fetchLogs(limit)
    }
  }

  async fetchAlerts(): Promise<AlertItem[]> {
    try {
      const { data } = await this.client.get<AlertItem[]>('/alerts')
      return data
    } catch {
      return fallback.fetchAlerts()
    }
  }

  async acknowledgeAlert(id: string): Promise<void> {
    try {
      await this.client.post(`/alerts/${id}/acknowledge`)
    } catch {
      await fallback.acknowledgeAlert(id)
    }
  }

  async fetchDashboardMetrics(): Promise<DashboardMetrics> {
    try {
      const { data } = await this.client.get<DashboardMetrics>('/dashboard/metrics')
      return data
    } catch {
      return fallback.fetchDashboardMetrics()
    }
  }
}
