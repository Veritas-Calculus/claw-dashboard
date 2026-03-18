import styles from './Badge.module.css'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
}

export default function Badge({ children, variant = 'default', dot = false }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  )
}

interface StatusDotProps {
  status: 'active' | 'idle' | 'error' | 'offline'
  size?: number
}

const statusToVariant: Record<StatusDotProps['status'], BadgeVariant> = {
  active: 'success',
  idle: 'info',
  error: 'error',
  offline: 'default',
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  const variant = statusToVariant[status]
  return (
    <span
      className={`${styles.statusDot} ${styles[variant]}`}
      style={{ width: size, height: size }}
      title={status}
    />
  )
}
