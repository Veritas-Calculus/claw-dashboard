import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IconDashboard,
  IconAgent,
  IconTask,
  IconLog,
  IconAlert,
  IconTopology,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
} from '@/components/common/Icons'
import styles from './Sidebar.module.css'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/', icon: IconDashboard, labelKey: 'nav.dashboard' },
  { path: '/agents', icon: IconAgent, labelKey: 'nav.agents' },
  { path: '/tasks', icon: IconTask, labelKey: 'nav.tasks' },
  { path: '/logs', icon: IconLog, labelKey: 'nav.logs' },
  { path: '/alerts', icon: IconAlert, labelKey: 'nav.alerts' },
  { path: '/topology', icon: IconTopology, labelKey: 'nav.topology' },
]

const bottomItems = [
  { path: '/settings', icon: IconSettings, labelKey: 'nav.settings' },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        {!collapsed && <span className={styles.logo}>Claw</span>}
        <button
          className={styles.toggleBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <IconChevronRight size={16} /> : <IconChevronLeft size={16} />}
        </button>
      </div>

      {/* Main nav */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className={styles.bottom}>
        <ul className={styles.navList}>
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  title={collapsed ? t(item.labelKey) : undefined}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
