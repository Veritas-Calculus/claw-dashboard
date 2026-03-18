import { useTranslation } from 'react-i18next'
import { Card } from '@/components/common'

export default function Dashboard() {
  const { t } = useTranslation()

  return (
    <div id="dashboard-page">
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
        {t('nav.dashboard')}
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <Card>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {t('status.active')}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-success)' }}>0</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {t('status.idle')}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-info)' }}>0</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {t('status.error')}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-error)' }}>0</div>
        </Card>
        <Card>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            {t('status.offline')}
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>0</div>
        </Card>
      </div>
    </div>
  )
}
