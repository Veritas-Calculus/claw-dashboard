import type { Agent } from '@/store/agentStore'

// --- Types ---

export interface TaskItem {
  id: string
  name: string
  agentId: string
  agentName: string
  status: 'running' | 'completed' | 'failed' | 'queued'
  progress: number
  createdAt: string
  duration: string
}

export interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  agentName: string
  message: string
}

export interface AlertItem {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  message: string
  agentName: string
  timestamp: string
  acknowledged: boolean
}

export interface MetricPoint {
  time: string
  value: number
}

export interface DashboardMetrics {
  agentsByStatus: { active: number; idle: number; error: number; offline: number }
  taskCompletionRate: number
  avgResponseTime: number
  totalTokensToday: number
  taskTrend: MetricPoint[]
  cpuTrend: MetricPoint[]
  memoryTrend: MetricPoint[]
}

// --- Mock Data Generators ---

const agentNames = [
  'CodeReviewer', 'DataAnalyst', 'TestRunner', 'DocWriter',
  'SecurityScanner', 'DeployBot', 'ChatAssistant', 'Translator',
  'ImageProcessor', 'PipelineOrchestrator', 'LogAnalyzer', 'AlertRouter',
]

const taskNames = [
  'Code review for PR #142', 'Analyze quarterly sales data',
  'Run integration test suite', 'Generate API documentation',
  'Scan dependencies for CVEs', 'Deploy staging environment',
  'Process customer support tickets', 'Translate UI strings to Japanese',
  'Resize and optimize product images', 'Execute data pipeline ETL',
  'Parse error logs from production', 'Route P1 alerts to on-call',
  'Generate performance report', 'Update database migrations',
  'Build ML training dataset', 'Run load test simulation',
]

const logMessages = [
  'Starting task execution...',
  'Connected to upstream API successfully',
  'Processing batch 3/10 (128 items)',
  'Rate limit approaching: 85% of quota used',
  'Retrying failed request (attempt 2/3)',
  'Task completed in 4.2s',
  'Memory usage: 312MB / 512MB',
  'Token consumption: 2,450 tokens',
  'WebSocket connection established',
  'Agent heartbeat received',
  'Cache hit ratio: 94.2%',
  'Error: Connection timeout after 30s',
  'Warning: Response time exceeding SLO threshold',
  'Checkpoint saved to persistent storage',
  'Model inference completed: 150ms latency',
  'Graceful shutdown initiated',
]

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10
}

function generateTimePoints(hours: number, interval: number): string[] {
  const points: string[] = []
  const now = new Date()
  for (let i = hours * 60; i >= 0; i -= interval) {
    const t = new Date(now.getTime() - i * 60000)
    points.push(t.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }))
  }
  return points
}

function generateTrendData(hours: number, base: number, variance: number): MetricPoint[] {
  return generateTimePoints(hours, 15).map((time) => ({
    time,
    value: Math.round(base + (Math.random() - 0.5) * variance),
  }))
}

// --- Mock Data ---

const statuses: Agent['status'][] = ['active', 'idle', 'error', 'offline']
const statusWeights = [0.5, 0.25, 0.15, 0.1]

function weightedStatus(): Agent['status'] {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < statuses.length; i++) {
    cumulative += statusWeights[i]
    if (r <= cumulative) return statuses[i]
  }
  return 'active'
}

export const mockAgents: Agent[] = agentNames.map((name, i) => {
  const status = weightedStatus()
  return {
    id: `agent-${String(i + 1).padStart(3, '0')}`,
    name,
    status,
    cpu: status === 'offline' ? 0 : randomBetween(5, 95),
    memory: status === 'offline' ? 0 : randomBetween(20, 85),
    taskCount: status === 'active' ? Math.floor(Math.random() * 8) + 1 : 0,
    lastSeen: status === 'offline'
      ? new Date(Date.now() - Math.random() * 86400000).toISOString()
      : new Date(Date.now() - Math.random() * 60000).toISOString(),
  }
})

export const mockTasks: TaskItem[] = taskNames.map((name, i) => {
  const taskStatuses: TaskItem['status'][] = ['running', 'completed', 'failed', 'queued']
  const status = randomFrom(taskStatuses)
  const agent = randomFrom(mockAgents)
  return {
    id: `task-${String(i + 1).padStart(4, '0')}`,
    name,
    agentId: agent.id,
    agentName: agent.name,
    status,
    progress: status === 'completed' ? 100 : status === 'failed' ? randomBetween(10, 80) : status === 'queued' ? 0 : randomBetween(10, 90),
    createdAt: new Date(Date.now() - Math.random() * 7200000).toISOString(),
    duration: status === 'queued' ? '--' : `${Math.floor(Math.random() * 300)}s`,
  }
})

export function mockLogs(count: number): LogEntry[] {
  const levels: LogEntry['level'][] = ['info', 'info', 'info', 'warn', 'error', 'debug']
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${Date.now()}-${i}`,
    timestamp: new Date(Date.now() - i * 3000 - Math.random() * 1000).toISOString(),
    level: randomFrom(levels),
    agentName: randomFrom(agentNames),
    message: randomFrom(logMessages),
  }))
}

export const mockAlerts: AlertItem[] = [
  {
    id: 'alert-001',
    severity: 'critical',
    title: 'Agent SecurityScanner unresponsive',
    message: 'No heartbeat received for 5 minutes. Last seen processing CVE scan.',
    agentName: 'SecurityScanner',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-002',
    severity: 'warning',
    title: 'High memory usage on DataAnalyst',
    message: 'Memory usage at 92% (472MB / 512MB). Consider scaling resources.',
    agentName: 'DataAnalyst',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    acknowledged: false,
  },
  {
    id: 'alert-003',
    severity: 'warning',
    title: 'Task failure rate above threshold',
    message: '3 consecutive failures on PipelineOrchestrator in the last 30 minutes.',
    agentName: 'PipelineOrchestrator',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    acknowledged: true,
  },
  {
    id: 'alert-004',
    severity: 'info',
    title: 'Scheduled maintenance window',
    message: 'System maintenance scheduled for 02:00-04:00 UTC.',
    agentName: 'System',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    acknowledged: true,
  },
]

export function getMockDashboardMetrics(): DashboardMetrics {
  const counts = { active: 0, idle: 0, error: 0, offline: 0 }
  mockAgents.forEach((a) => counts[a.status]++)

  return {
    agentsByStatus: counts,
    taskCompletionRate: 94.5,
    avgResponseTime: 1.8,
    totalTokensToday: 148720,
    taskTrend: generateTrendData(6, 12, 8),
    cpuTrend: generateTrendData(6, 45, 30),
    memoryTrend: generateTrendData(6, 55, 20),
  }
}
