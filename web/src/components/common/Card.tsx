import type { ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hoverable?: boolean
  onClick?: () => void
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[padding]} ${hoverable ? styles.hoverable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  )
}
