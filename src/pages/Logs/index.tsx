import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/common'
import { mockLogs } from '@/lib/mockData'
import type { LogEntry } from '@/lib/mockData'
import styles from './Logs.module.css'

const levelConfig: Record<LogEntry['level'], { color: string; bg: string }> = {
  info:  { color: 'var(--color-info)',    bg: 'rgba(100, 210, 255, 0.1)' },
  warn:  { color: 'var(--color-warning)', bg: 'rgba(255, 214, 10, 0.1)' },
  error: { color: 'var(--color-error)',   bg: 'rgba(255, 69, 58, 0.1)' },
  debug: { color: 'var(--color-text-tertiary)', bg: 'rgba(134, 134, 139, 0.1)' },
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function Logs() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<LogEntry['level'] | 'all'>('all')

  const logs = useMemo(() => mockLogs(100), [])

  const filtered = logs.filter((log) => {
    if (levelFilter !== 'all' && log.level !== levelFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        log.message.toLowerCase().includes(q) ||
        log.agentName.toLowerCase().includes(q)
      )
    }
    return true
  })

  return (
    <div id="logs-page" className={styles.page}>
      <h1 className={styles.pageTitle}>{t('nav.logs')}</h1>

      <Card padding="sm">
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            placeholder={`${t('common.search')} logs...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.levelFilters}>
            {(['all', 'error', 'warn', 'info', 'debug'] as const).map((l) => (
              <button
                key={l}
                className={`${styles.levelBtn} ${levelFilter === l ? styles.levelActive : ''}`}
                onClick={() => setLevelFilter(l)}
                style={levelFilter === l && l !== 'all' ? { backgroundColor: levelConfig[l]?.bg, color: levelConfig[l]?.color } : undefined}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="sm" className={styles.logContainer}>
        <div className={styles.logList}>
          {filtered.map((log) => {
            const cfg = levelConfig[log.level]
            return (
              <div key={log.id} className={styles.logRow}>
                <span className={styles.logTime}>{formatTimestamp(log.timestamp)}</span>
                <span
                  className={styles.logLevel}
                  style={{ color: cfg.color, backgroundColor: cfg.bg }}
                >
                  {log.level.toUpperCase()}
                </span>
                <span className={styles.logAgent}>{log.agentName}</span>
                <span className={styles.logMsg}>{log.message}</span>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className={styles.empty}>{t('common.noData')}</div>
          )}
        </div>
      </Card>
    </div>
  )
}
