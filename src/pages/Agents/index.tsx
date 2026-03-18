import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Badge, Table } from '@/components/common'
import { StatusDot } from '@/components/common/Badge'

import { IconSearch, IconRefresh } from '@/components/common/Icons'
import Button from '@/components/common/Button'
import { mockAgents } from '@/lib/mockData'
import type { Agent } from '@/store/agentStore'
import styles from './Agents.module.css'

const statusLabel: Record<Agent['status'], string> = {
  active: 'Active',
  idle: 'Idle',
  error: 'Error',
  offline: 'Offline',
}

const statusVariant: Record<Agent['status'], 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  active: 'success',
  idle: 'info',
  error: 'error',
  offline: 'default',
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

export default function Agents() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Agent['status'] | 'all'>('all')

  const filtered = mockAgents.filter((a) => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    return true
  })

  const columns = [
    {
      key: 'name',
      header: 'Agent',
      sortable: true,
      render: (row: Agent) => (
        <div className={styles.agentCell}>
          <StatusDot status={row.status} />
          <span className={styles.agentName}>{row.name}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: t('common.filter'),
      sortable: true,
      render: (row: Agent) => (
        <Badge variant={statusVariant[row.status]} dot>{statusLabel[row.status]}</Badge>
      ),
    },
    {
      key: 'cpu',
      header: 'CPU',
      sortable: true,
      render: (row: Agent) => (
        <div className={styles.metricCell}>
          <div className={styles.metricBar}>
            <div
              className={styles.metricFill}
              style={{
                width: `${row.cpu}%`,
                backgroundColor: row.cpu > 80 ? 'var(--color-error)' : row.cpu > 60 ? 'var(--color-warning)' : 'var(--color-success)',
              }}
            />
          </div>
          <span className={styles.metricValue}>{row.cpu}%</span>
        </div>
      ),
    },
    {
      key: 'memory',
      header: 'Memory',
      sortable: true,
      render: (row: Agent) => (
        <div className={styles.metricCell}>
          <div className={styles.metricBar}>
            <div
              className={styles.metricFill}
              style={{
                width: `${row.memory}%`,
                backgroundColor: row.memory > 80 ? 'var(--color-error)' : row.memory > 60 ? 'var(--color-warning)' : 'var(--color-accent)',
              }}
            />
          </div>
          <span className={styles.metricValue}>{row.memory}%</span>
        </div>
      ),
    },
    {
      key: 'taskCount',
      header: 'Tasks',
      sortable: true,
      width: '80px',
      render: (row: Agent) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{row.taskCount}</span>,
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      sortable: true,
      render: (row: Agent) => <span className={styles.dimText}>{timeAgo(row.lastSeen)}</span>,
    },
  ]

  return (
    <div id="agents-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{t('nav.agents')}</h1>
        <Button variant="secondary" icon={<IconRefresh size={14} />} size="sm">
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm" className={styles.filterBar}>
        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <IconSearch size={14} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder={`${t('common.search')} agents...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.statusFilters}>
            {(['all', 'active', 'idle', 'error', 'offline'] as const).map((s) => (
              <button
                key={s}
                className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : statusLabel[s]}
                {s !== 'all' && (
                  <span className={styles.filterCount}>
                    {mockAgents.filter((a) => a.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Table<Agent>
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyText="No agents found"
      />
    </div>
  )
}
