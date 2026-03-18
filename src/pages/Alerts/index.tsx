import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Badge } from '@/components/common'
import Button from '@/components/common/Button'
import { IconCheck } from '@/components/common/Icons'
import { mockAlerts } from '@/lib/mockData'
import type { AlertItem } from '@/lib/mockData'
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
  const [alerts, setAlerts] = useState(mockAlerts)
  const [filter, setFilter] = useState<AlertItem['severity'] | 'all'>('all')

  const filtered = filter === 'all' ? alerts : alerts.filter((a) => a.severity === filter)

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map((a) => a.id === id ? { ...a, acknowledged: true } : a))
  }

  return (
    <div id="alerts-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{t('nav.alerts')}</h1>
        <Badge variant="error" dot>
          {alerts.filter((a) => !a.acknowledged).length} unacknowledged
        </Badge>
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
