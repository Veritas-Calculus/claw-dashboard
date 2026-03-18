import { useTranslation } from 'react-i18next'
import { Card } from '@/components/common'
import Button from '@/components/common/Button'
import { Select } from '@/components/common/Input'
import { useThemeStore } from '@/store'
import { IconSun, IconMoon } from '@/components/common/Icons'
import styles from './Settings.module.css'

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()

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

        {/* API Configuration */}
        <Card>
          <h2 className={styles.sectionTitle}>{t('settings.apiEndpoint')}</h2>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>API Base URL</div>
              <div className={styles.settingDesc}>
                <code className={styles.code}>{import.meta.env.VITE_API_BASE_URL || '/api/v1'}</code>
              </div>
            </div>
          </div>
          <div className={styles.settingRow}>
            <div>
              <div className={styles.settingLabel}>WebSocket URL</div>
              <div className={styles.settingDesc}>
                <code className={styles.code}>{import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws'}</code>
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
              <span className={styles.aboutValue}>0.1.0-dev</span>
            </div>
            <div className={styles.aboutItem}>
              <span className={styles.aboutLabel}>Build</span>
              <span className={styles.aboutValue}>Phase 2</span>
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
