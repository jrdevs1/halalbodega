import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_URL } from '../App'
import './Order.css'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    document.title = 'Order Confirmed — The Halal Bodega'
    if (orderId) {
      fetch(`${API_URL}/api/orders/${orderId}`)
        .then(r => r.json())
        .then(setOrder)
        .catch(() => {})
    }
  }, [orderId])

  return (
    <div className="order-page">
      <div className="order-confirm container">
        <div className="order-confirm__icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h1 className="display-lg" style={{marginTop: '1rem'}}>Thank You!</h1>
        <p className="body-lg text-muted" style={{maxWidth: '460px'}}>
          Your order has been confirmed and payment received. We&apos;re preparing your food now!
        </p>
        
        {order && (
          <div className="order-confirm__details" style={{marginTop: '2rem'}}>
            <p><strong>Order ID:</strong> {order.id?.slice(0, 8).toUpperCase()}</p>
            <p><strong>Status:</strong> <span className="text-gold">{order.status?.toUpperCase()}</span></p>
            <p><strong>Total:</strong> ${order.total?.toFixed(2)}</p>
            <p><strong>Name:</strong> {order.customer_name}</p>
          </div>
        )}

        <div style={{display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center'}}>
          <Link to="/menu" className="btn btn-primary">Order More</Link>
          <Link to="/" className="btn btn-outline">Back Home</Link>
        </div>
      </div>
    </div>
  )
}
