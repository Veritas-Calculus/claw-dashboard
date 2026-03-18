import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Badge } from '@/components/common'
import Button from '@/components/common/Button'
import { IconCheck, IconDownload } from '@/components/common/Icons'
import { useDataAdapter } from '@/hooks'
import { notifyAlert, requestNotificationPermission } from '@/lib/notifications'
import { exportCSV } from '@/lib/export'
import type { AlertItem } from '@/lib/mockData'
import { getAdapter } from '@/lib/adapters'
import styles from './Alerts.module.css'

const severityVariant: Record<AlertItem['severity'], 'error' | 'warning' | 'info'> = {
  critical: 'error',
  warning: 'warning',
  info: 'info',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}

export default function Alerts() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<AlertItem['severity'] | 'all'>('all')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  const fetchAlerts = useCallback((a: { fetchAlerts: () => Promise<AlertItem[]> }) => a.fetchAlerts(), [])
  const { data: alerts, refetch } = useDataAdapter<AlertItem[]>(fetchAlerts)

  // Auto-refresh alerts
  useEffect(() => {
    const timer = setInterval(refetch, 10000)
    return () => clearInterval(timer)
  }, [refetch])

  const handleAcknowledge = async (id: string) => {
    await getAdapter().acknowledgeAlert(id)
    refetch()
  }

  const handleEnableNotifications = async () => {
    const ok = await requestNotificationPermission()
    setNotificationsEnabled(ok)
    if (ok) {
      notifyAlert('info', 'Notifications Enabled', 'You will receive desktop notifications for new alerts.')
    }
  }

  const handleExport = () => {
    if (!alerts) return
    exportCSV(alerts, `claw-alerts-${new Date().toISOString().slice(0, 10)}`, [
      { key: 'id', header: 'ID' },
      { key: 'severity', header: 'Severity' },
      { key: 'title', header: 'Title' },
      { key: 'message', header: 'Message' },
      { key: 'agentName', header: 'Agent' },
      { key: 'timestamp', header: 'Time' },
      { key: 'acknowledged', header: 'Acknowledged' },
    ])
  }

  if (!alerts) {
    return <div className={styles.page}>Loading...</div>
  }

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)
  const unackCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div id="alerts-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{t('nav.alerts')}</h1>
        <div className={styles.headerActions}>
          <Badge variant="error" dot>
            {unackCount} unacknowledged
          </Badge>
          {!notificationsEnabled && (
            <Button variant="secondary" size="sm" onClick={handleEnableNotifications}>
              Enable Notifications
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            icon={<IconDownload size={14} />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <Card padding="sm">
        <div className={styles.filterRow}>
          {(['all', 'critical', 'warning', 'info'] as const).map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className={styles.filterCount}>
                  {alerts.filter((a) => a.severity === s).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      <div className={styles.alertList}>
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            className={`${styles.alertCard} ${alert.acknowledged ? styles.acknowledged : ''}`}
          >
            <div className={styles.alertHeader}>
              <Badge variant={severityVariant[alert.severity]} dot>
                {alert.severity.toUpperCase()}
              </Badge>
              <span className={styles.alertTime}>{timeAgo(alert.timestamp)}</span>
            </div>
            <div className={styles.alertTitle}>{alert.title}</div>
            <div className={styles.alertMsg}>{alert.message}</div>
            <div className={styles.alertFooter}>
              <span className={styles.alertAgent}>{alert.agentName}</span>
              {!alert.acknowledged && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<IconCheck size={14} />}
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
              {alert.acknowledged && (
                <span className={styles.ackedLabel}>Acknowledged</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
