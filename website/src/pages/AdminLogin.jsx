import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../App'
import './Admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await res.json()
      localStorage.setItem('admin_token', data.token)
      localStorage.setItem('admin_user', JSON.stringify({ username: data.username, role: data.role }))
      navigate('/admin')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login" id="admin-login-page">
      <div className="admin-login__card">
        <div className="admin-login__header">
          <img src="/halalbodegalogogreybg.jpg" alt="The Halal Bodega" className="admin-login__logo" />
          <h1 className="heading-lg">Kitchen Portal</h1>
          <p className="body-sm text-muted">Sign in to manage orders</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login__form">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div className="form-error form-error--global">{error}</div>}

          <button className="btn btn-primary btn-lg" style={{width: '100%'}} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
