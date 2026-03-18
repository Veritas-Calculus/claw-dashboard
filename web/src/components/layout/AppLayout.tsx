import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false)
  }, [pathname])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen)
    } else {
      setCollapsed(!collapsed)
    }
  }

  return (
    <div
      className={`${styles.layout} ${collapsed ? 'sidebar-collapsed' : ''}`}
    >
      <Sidebar
        collapsed={isMobile ? !mobileOpen : collapsed}
        onToggle={() => (isMobile ? setMobileOpen(false) : setCollapsed(!collapsed))}
      />

      {/* Mobile overlay */}
      {mobileOpen && <div className={styles.overlay} onClick={() => setMobileOpen(false)} />}

      <Header onMenuClick={handleMenuClick} />

      <main
        className={styles.main}
        style={{
          marginLeft: isMobile
            ? 0
            : collapsed
              ? 'var(--sidebar-collapsed-width)'
              : 'var(--sidebar-width)',
        }}
      >
        {children}
      </main>
    </div>
  )
}
