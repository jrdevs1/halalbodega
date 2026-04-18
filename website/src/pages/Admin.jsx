import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../App'
import { escapeHtml } from '../utils/sanitize'
import './Admin.css'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#D4A853', next: 'confirmed' },
  confirmed: { label: 'Confirmed', color: '#4CAF50', next: 'preparing' },
  preparing: { label: 'Preparing', color: '#FF9800', next: 'ready' },
  ready: { label: 'Ready', color: '#2196F3', next: 'delivered' },
  delivered: { label: 'Delivered', color: '#9E9E9E', next: null },
  cancelled: { label: 'Cancelled', color: '#C94C4C', next: null },
}

export default function Admin() {
  const [orders, setOrders] = useState([])
  const [counts, setCounts] = useState({})
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('admin_token')

  useEffect(() => {
    if (!token) {
      navigate('/admin/login')
      return
    }
    const u = localStorage.getItem('admin_user')
    if (u) setUser(JSON.parse(u))
  }, [token, navigate])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders?status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('admin_token')
        navigate('/admin/login')
        return
      }
      const data = await res.json()
      setOrders(data.orders || [])
      setCounts(data.counts || {})
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }, [token, filter, navigate])

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setStats(await res.json())
    } catch {
      // Stats not critical
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchOrders()
      fetchStats()
    }
  }, [fetchOrders, fetchStats, token])

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!token) return
    const interval = setInterval(() => {
      fetchOrders()
      fetchStats()
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchOrders, fetchStats, token])

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        fetchOrders()
        fetchStats()
      }
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    navigate('/admin/login')
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!token) return null

  return (
    <div className="admin" id="admin-dashboard">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-header__left">
          <img src="/halalbodegalogogreybg.jpg" alt="The Halal Bodega" className="admin-header__logo" />
          <div>
            <h1 className="admin-header__title">Kitchen Dashboard</h1>
            <p className="admin-header__subtitle">Welcome, {user?.username ? escapeHtml(user.username) : 'Guest'}</p>
          </div>
        </div>
        <div className="admin-header__actions">
          <button className="btn btn-outline btn-sm" onClick={fetchOrders} aria-label="Refresh orders">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats Cards */}
        {stats && (
          <div className="admin-stats">
            <div className="admin-stat-card">
              <span className="admin-stat__label">Today&apos;s Orders</span>
              <span className="admin-stat__value">{stats.today.orders}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat__label">Today&apos;s Revenue</span>
              <span className="admin-stat__value admin-stat__value--gold">${stats.today.revenue.toFixed(2)}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat__label">Active Orders</span>
              <span className="admin-stat__value admin-stat__value--green">{stats.activeOrders}</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat__label">Total Revenue</span>
              <span className="admin-stat__value">${stats.total.revenue.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="admin-filters">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              className={`admin-filter ${filter === s ? 'admin-filter--active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {counts[s] !== undefined && <span className="admin-filter__count">{counts[s]}</span>}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="admin-loading">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <p className="heading-md text-muted">No orders found</p>
            <p className="body-sm text-muted">Orders will appear here in real-time</p>
          </div>
        ) : (
          <div className="admin-orders">
            {orders.map(order => {
              const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              return (
                <div className="admin-order" key={order.id}>
                  <div className="admin-order__header">
                    <div className="admin-order__id">
                      <span className="admin-order__hash">#{order.id.slice(0, 8).toUpperCase()}</span>
                      <span className="admin-order__time">{formatDate(order.created_at)} · {formatTime(order.created_at)}</span>
                    </div>
                    <span className="admin-order__status" style={{
                      background: `${config.color}20`,
                      color: config.color,
                      borderColor: `${config.color}40`
                    }}>
                      {config.label}
                    </span>
                  </div>

                  <div className="admin-order__customer">
                    <strong>{escapeHtml(order.customer_name)}</strong>
                    <span>{escapeHtml(order.customer_phone)}</span>
                    {order.customer_email && <span>{escapeHtml(order.customer_email)}</span>}
                  </div>

                  <div className="admin-order__items">
                    {order.items.map((item, idx) => (
                      <div className="admin-order__item" key={idx}>
                        <span className="admin-order__item-qty">{item.quantity}×</span>
                        <span className="admin-order__item-name">{escapeHtml(item.name)}</span>
                        <span className="admin-order__item-price">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="admin-order__notes">
                      <strong>Notes:</strong> {escapeHtml(order.notes)}
                    </div>
                  )}

                  <div className="admin-order__footer">
                    <div className="admin-order__total">
                      <span>Total:</span>
                      <span className="admin-order__total-val">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="admin-order__actions">
                      {config.next && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => updateStatus(order.id, config.next)}
                        >
                          Mark {STATUS_CONFIG[config.next]?.label}
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
