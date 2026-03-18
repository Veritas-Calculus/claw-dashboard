import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import styles from './Login.module.css'

interface AuthStatus {
  needsSetup: boolean
}

interface AuthResponse {
  token: string
  username: string
  role: string
}

export default function Login() {
  const navigate = useNavigate()
  const [needsSetup, setNeedsSetup] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('claw-token')
    if (token) {
      api.get('/auth/me').then(() => {
        navigate('/', { replace: true })
      }).catch(() => {
        localStorage.removeItem('claw-token')
        checkSetup()
      })
    } else {
      checkSetup()
    }
  }, [navigate])

  async function checkSetup() {
    try {
      const { data } = await api.get<AuthStatus>('/auth/status')
      setNeedsSetup(data.needsSetup)
    } catch {
      setError('Unable to connect to API')
    } finally {
      setChecking(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = needsSetup ? '/auth/setup' : '/auth/login'
      const { data } = await api.post<AuthResponse>(endpoint, { username, password })
      localStorage.setItem('claw-token', data.token)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Authentication failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          <div className={styles.loginHeader}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Claw Dashboard</h1>
          <p>{needsSetup ? 'Create admin account' : 'Sign in to continue'}</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={needsSetup ? 'Choose a username' : 'Username'}
              autoFocus
              required
              minLength={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={needsSetup ? 'Choose a password (6+ chars)' : 'Password'}
              required
              minLength={needsSetup ? 6 : 1}
            />
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={loading || !username || !password}
          >
            {loading ? 'Please wait...' : needsSetup ? 'Create Admin' : 'Sign In'}
          </button>

          {error && <p className={styles.loginError}>{error}</p>}
        </form>
      </div>
    </div>
  )
}
