import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/common'
import Button from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { useThemeStore } from '@/store'
import { IconSun, IconMoon } from '@/components/common/Icons'
import {
  switchAdapter,
  loadConfig,
  getCurrentAdapterType,
  type AdapterConfig,
  type AdapterType,
} from '@/lib/adapters'
import { useWebSocket } from '@/hooks'
import { StatusDot } from '@/components/common/Badge'
import styles from './Settings.module.css'

const adapterOptions = [
  { value: 'mock', label: 'Mock (Offline)' },
  { value: 'openclaw', label: 'OpenClaw API' },
  { value: 'generic', label: 'Generic REST' },
]

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const { state: wsState } = useWebSocket()

  const [config, setConfig] = useState<AdapterConfig>(loadConfig)
  const [saved, setSaved] = useState(false)

  const handleAdapterChange = (type: AdapterType) => {
    const newConfig = { ...config, type }
    setConfig(newConfig)
    switchAdapter(newConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUrlChange = (field: keyof AdapterConfig, value: string) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
  }

  const handleApplyConfig = () => {
    switchAdapter(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const wsStatusDot: 'active' | 'idle' | 'error' | 'offline' =
    wsState === 'connected' ? 'active'
    : wsState === 'connecting' || wsState === 'reconnecting' ? 'idle'
    : 'offline'

  return (
    <div id="settings-page" className={styles.page}>
      <h1 className={styles.pageTitle}>{t('nav.settings')}</h1>

      <div className={styles.grid}>
        {/* Appearance */}
        <Card>
          <h2 className={styles.sectionTitle}>Appearance</h2>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>{t('settings.theme')}</div>
              <div className={styles.settingDesc}>
                {theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
            </Button>
          </div>
        </Card>

        {/* Language */}
        <Card>
          <h2 className={styles.sectionTitle}>{t('settings.language')}</h2>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>{t('settings.language')}</div>
              <div className={styles.settingDesc}>Select display language</div>
            </div>
            <Select
              options={[
                { value: 'zh-CN', label: '中文 (简体)' },
                { value: 'en-US', label: 'English' },
              ]}
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className={styles.selectField}
            />
          </div>
        </Card>

        {/* Data Source */}
        <Card>
          <h2 className={styles.sectionTitle}>Data Source</h2>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>Adapter Type</div>
              <div className={styles.settingDesc}>
                Current: <strong>{getCurrentAdapterType()}</strong>
                {saved && <span className={styles.savedTag}> -- Saved</span>}
              </div>
            </div>
            <Select
              options={adapterOptions}
              value={config.type}
              onChange={(e) => handleAdapterChange(e.target.value as AdapterType)}
              className={styles.selectField}
            />
          </div>

          {config.type !== 'mock' && (
            <>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>API Base URL</div>
                  <div className={styles.settingDesc}>REST endpoint for data</div>
                </div>
                <input
                  className={styles.urlInput}
                  value={config.apiBaseUrl}
                  onChange={(e) => handleUrlChange('apiBaseUrl', e.target.value)}
                  onBlur={handleApplyConfig}
                  placeholder="/api/v1"
                />
              </div>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>WebSocket URL</div>
                  <div className={styles.settingDesc}>Real-time event stream</div>
                </div>
                <input
                  className={styles.urlInput}
                  value={config.wsUrl}
                  onChange={(e) => handleUrlChange('wsUrl', e.target.value)}
                  onBlur={handleApplyConfig}
                  placeholder="ws://localhost:8080/ws"
                />
              </div>
            </>
          )}
        </Card>

        {/* Connection Status */}
        <Card>
          <h2 className={styles.sectionTitle}>Connection Status</h2>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>WebSocket</div>
              <div className={styles.settingDesc} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StatusDot status={wsStatusDot} />
                {wsState}
              </div>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <h2 className={styles.sectionTitle}>About</h2>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutItem}>
              <span className={styles.aboutLabel}>Version</span>
              <span className={styles.aboutValue}>0.2.0-dev</span>
            </div>
            <div className={styles.aboutItem}>
              <span className={styles.aboutLabel}>Build</span>
              <span className={styles.aboutValue}>Phase 3</span>
            </div>
            <div className={styles.aboutItem}>
              <span className={styles.aboutLabel}>License</span>
              <span className={styles.aboutValue}>MIT</span>
            </div>
            <div className={styles.aboutItem}>
              <span className={styles.aboutLabel}>Organization</span>
              <span className={styles.aboutValue}>
                <a href="https://github.com/Veritas-Calculus" target="_blank" rel="noopener noreferrer">
                  Veritas-Calculus
                </a>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
