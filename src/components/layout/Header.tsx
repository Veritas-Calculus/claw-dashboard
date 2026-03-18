import { useTranslation } from 'react-i18next'
import { IconSearch, IconSun, IconMoon, IconMenu } from '@/components/common/Icons'
import { useThemeStore } from '@/store'
import styles from './Header.module.css'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { t } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Toggle menu">
          <IconMenu size={18} />
        </button>
        <div className={styles.searchBox}>
          <IconSearch size={14} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={`${t('common.search')}...`}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
        >
          {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
        </button>
        <div className={styles.avatar}>
          <span>A</span>
        </div>
      </div>
    </header>
  )
}
