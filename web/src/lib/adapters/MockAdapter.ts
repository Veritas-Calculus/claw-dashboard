/**
 * Mock adapter — returns static/generated mock data with simulated latency.
 * Used during development and when no backend is connected.
 */

import type { DataAdapter } from './types'
import type { Agent } from '@/store/agentStore'
import {
  mockAgents,
  mockTasks,
  mockLogs,
  mockAlerts as _mockAlerts,
  getMockDashboardMetrics,
} from '@/lib/mockData'
import type { TaskItem, LogEntry, AlertItem, DashboardMetrics } from '@/lib/mockData'

/** Simulate network latency */
function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 100))
}

export class MockAdapter implements DataAdapter {
  readonly name = 'Mock (Offline)'

  private alerts = [..._mockAlerts]
  private agentSnapshot = [...mockAgents]

  // Simulate agent state drift: randomly mutate CPU/memory each fetch
  private mutateAgents(): Agent[] {
    this.agentSnapshot = this.agentSnapshot.map((a) => {
      if (a.status === 'offline') return a
      return {
        ...a,
        cpu: Math.max(0, Math.min(100, a.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, a.memory + (Math.random() - 0.5) * 5)),
        lastSeen: new Date().toISOString(),
      }
    })
    return this.agentSnapshot
  }

  async fetchAgents(): Promise<Agent[]> {
    await delay()
    return this.mutateAgents()
  }

  async fetchTasks(): Promise<TaskItem[]> {
    await delay()
    return mockTasks.map((t) => ({
      ...t,
      progress: t.status === 'running'
        ? Math.min(100, t.progress + Math.random() * 5)
        : t.progress,
    }))
  }

  async fetchLogs(limit = 100): Promise<LogEntry[]> {
    await delay(100)
    return mockLogs(limit)
  }

  async fetchAlerts(): Promise<AlertItem[]> {
    await delay()
    return this.alerts
  }

  async acknowledgeAlert(id: string): Promise<void> {
    await delay(150)
    this.alerts = this.alerts.map((a) =>
      a.id === id ? { ...a, acknowledged: true } : a,
    )
  }

  async fetchDashboardMetrics(): Promise<DashboardMetrics> {
    await delay()
    return getMockDashboardMetrics()
  }
}
