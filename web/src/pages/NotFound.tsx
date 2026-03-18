import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div
      className="page"
      id="not-found-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
      }}
    >
      <h1 style={{ fontSize: '72px', fontWeight: 700, opacity: 0.3 }}>404</h1>
      <p>Page not found</p>
      <Link to="/" style={{ color: 'var(--color-accent)' }}>
        Back to Dashboard
      </Link>
    </div>
  )
}
