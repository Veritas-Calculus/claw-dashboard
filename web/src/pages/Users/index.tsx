import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/common'
import Button from '@/components/common/Button'
import { StatusDot } from '@/components/common/Badge'
import api from '@/lib/api'
import styles from './Users.module.css'

interface User {
  id: string
  username: string
  role: string
  createdAt: string
}

export default function Users() {
  const { t } = useTranslation()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState('viewer')

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await api.get<User[]>('/users')
      setUsers(data)
      setError('')
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    try {
      await api.post('/users', {
        username: newUsername,
        password: newPassword,
        role: newRole,
      })
      setShowForm(false)
      setNewUsername('')
      setNewPassword('')
      setNewRole('viewer')
      fetchUsers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create user'
      setError(msg)
    }
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`Delete user "${username}"?`)) return
    try {
      await api.delete(`/users/${id}`)
      fetchUsers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete user'
      setError(msg)
    }
  }

  async function handleToggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'viewer' : 'admin'
    try {
      await api.patch(`/users/${id}`, { role: newRole })
      fetchUsers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update role'
      setError(msg)
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.pageTitle}>{t('nav.users', 'User Management')}</h1>
        <Card><p className={styles.loading}>Loading...</p></Card>
      </div>
    )
  }

  return (
    <div id="users-page" className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>{t('nav.users', 'User Management')}</h1>
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add User'}
        </Button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className={styles.form}>
            <input
              className={styles.input}
              placeholder="Username (3+ chars)"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Password (6+ chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <select
              className={styles.select}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <Button type="submit" variant="primary" size="sm">Create</Button>
          </form>
        </Card>
      )}

      <Card>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className={styles.username}>
                  <StatusDot status={user.role === 'admin' ? 'active' : 'idle'} />
                  {user.username}
                </td>
                <td>
                  <button
                    className={`${styles.roleBadge} ${styles[user.role]}`}
                    onClick={() => handleToggleRole(user.id, user.role)}
                    title="Click to toggle role"
                  >
                    {user.role}
                  </button>
                </td>
                <td className={styles.date}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id, user.username)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
