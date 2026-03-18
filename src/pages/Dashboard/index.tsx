import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/common'
import { StatusDot } from '@/components/common/Badge'
import { getMockDashboardMetrics, mockTasks, mockAlerts } from '@/lib/mockData'
import styles from './Dashboard.module.css'

const statusColors = {
  active: 'var(--color-success)',
  idle: 'var(--color-info)',
  error: 'var(--color-error)',
  offline: 'var(--color-text-tertiary)',
}

const taskStatusColors: Record<string, string> = {
  running: 'var(--color-accent)',
  completed: 'var(--color-success)',
  failed: 'var(--color-error)',
  queued: 'var(--color-text-tertiary)',
}

const alertSeverityColors: Record<string, string> = {
  critical: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Dashboard() {
  const { t } = useTranslation()
  const metrics = useMemo(() => getMockDashboardMetrics(), [])
  const recentTasks = mockTasks.slice(0, 6)
  const recentAlerts = mockAlerts.slice(0, 4)

  const statCards = [
    { key: 'active', label: t('status.active'), value: metrics.agentsByStatus.active, color: statusColors.active },
    { key: 'idle', label: t('status.idle'), value: metrics.agentsByStatus.idle, color: statusColors.idle },
    { key: 'error', label: t('status.error'), value: metrics.agentsByStatus.error, color: statusColors.error },
    { key: 'offline', label: t('status.offline'), value: metrics.agentsByStatus.offline, color: statusColors.offline },
  ]

  return (
    <div id="dashboard-page" className={styles.dashboard}>
      <h1 className={styles.pageTitle}>{t('nav.dashboard')}</h1>

      {/* Agent status stats */}
      <div className={styles.statsGrid}>
        {statCards.map((s) => (
          <Card key={s.key} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
            <span className={styles.statFooter}>agents</span>
          </Card>
        ))}
      </div>

      {/* KPI row */}
      <div className={styles.kpiGrid}>
        <Card className={styles.statCard}>
          <span className={styles.kpiValue}>{metrics.taskCompletionRate}%</span>
          <span className={styles.kpiLabel}>Task Completion Rate</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.kpiValue}>{metrics.avgResponseTime}s</span>
          <span className={styles.kpiLabel}>Avg Response Time</span>
        </Card>
        <Card className={styles.statCard}>
          <span className={styles.kpiValue}>{formatNumber(metrics.totalTokensToday)}</span>
          <span className={styles.kpiLabel}>Tokens Today</span>
        </Card>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <Card>
          <div className={styles.chartTitle}>Task Execution Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.taskTrend}>
              <defs>
                <linearGradient id="colorTask" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a84ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0a84ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#86868b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#0a84ff" fill="url(#colorTask)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className={styles.chartTitle}>CPU / Memory</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metrics.cpuTrend}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30d158" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#30d158" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff9f0a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ff9f0a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#86868b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#86868b' }} axisLine={false} tickLine={false} width={30} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#30d158" fill="url(#colorCpu)" strokeWidth={2} name="CPU %" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom: recent tasks + alerts */}
      <div className={styles.bottomGrid}>
        <Card>
          <div className={styles.sectionTitle}>Recent Tasks</div>
          {recentTasks.map((task) => (
            <div key={task.id} className={styles.taskItem}>
              <StatusDot status={task.status === 'running' ? 'active' : task.status === 'failed' ? 'error' : task.status === 'completed' ? 'idle' : 'offline'} />
              <span className={styles.taskName}>{task.name}</span>
              <span className={styles.taskAgent}>{task.agentName}</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${task.progress}%`,
                    backgroundColor: taskStatusColors[task.status],
                  }}
                />
              </div>
            </div>
          ))}
        </Card>

        <Card>
          <div className={styles.sectionTitle}>Active Alerts</div>
          {recentAlerts.map((alert) => (
            <div key={alert.id} className={styles.alertItem}>
              <div
                className={styles.alertDot}
                style={{ backgroundColor: alertSeverityColors[alert.severity] }}
              />
              <div className={styles.alertContent}>
                <div className={styles.alertTitle}>{alert.title}</div>
                <div className={styles.alertTime}>{timeAgo(alert.timestamp)}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
