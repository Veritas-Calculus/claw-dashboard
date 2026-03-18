import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Badge, Table } from '@/components/common'
import { mockTasks } from '@/lib/mockData'
import type { TaskItem } from '@/lib/mockData'
import styles from './Tasks.module.css'

const statusVariant: Record<TaskItem['status'], 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  running: 'info',
  completed: 'success',
  failed: 'error',
  queued: 'default',
}

const statusLabel: Record<TaskItem['status'], string> = {
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  queued: 'Queued',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export default function Tasks() {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<TaskItem['status'] | 'all'>('all')

  const filtered = filter === 'all' ? mockTasks : mockTasks.filter((t) => t.status === filter)

  const columns = [
    { key: 'id', header: 'ID', width: '100px', sortable: true },
    {
      key: 'name',
      header: 'Task',
      sortable: true,
      render: (row: TaskItem) => <span style={{ fontWeight: 500 }}>{row.name}</span>,
    },
    {
      key: 'agentName',
      header: 'Agent',
      sortable: true,
      render: (row: TaskItem) => <span style={{ color: 'var(--color-text-secondary)' }}>{row.agentName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: TaskItem) => <Badge variant={statusVariant[row.status]} dot>{statusLabel[row.status]}</Badge>,
    },
    {
      key: 'progress',
      header: 'Progress',
      sortable: true,
      width: '120px',
      render: (row: TaskItem) => (
        <div className={styles.progressCell}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${row.progress}%` }} />
          </div>
          <span className={styles.progressText}>{row.progress}%</span>
        </div>
      ),
    },
    {
      key: 'duration',
      header: 'Duration',
      sortable: true,
      width: '80px',
      render: (row: TaskItem) => <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>{row.duration}</span>,
    },
    {
      key: 'createdAt',
      header: 'Started',
      sortable: true,
      width: '80px',
      render: (row: TaskItem) => <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>{formatTime(row.createdAt)}</span>,
    },
  ]

  return (
    <div id="tasks-page" className={styles.page}>
      <h1 className={styles.pageTitle}>{t('nav.tasks')}</h1>

      <Card padding="sm">
        <div className={styles.filterRow}>
          {(['all', 'running', 'completed', 'failed', 'queued'] as const).map((s) => (
            <button
              key={s}
              className={`${styles.filterBtn} ${filter === s ? styles.active : ''}`}
              onClick={() => setFilter(s)}
            >
              {s === 'all' ? 'All' : statusLabel[s]}
            </button>
          ))}
        </div>
      </Card>

      <Table<TaskItem>
        columns={columns}
        data={filtered}
        rowKey={(row) => row.id}
        emptyText="No tasks found"
      />
    </div>
  )
}
