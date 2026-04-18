import { useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from '../App'
import { API_URL } from '../App'
import './Order.css'

export default function Order() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useContext(CartContext)
  const [step, setStep] = useState('cart') // cart, info, confirm
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  const tax = Math.round(cartTotal * 0.0975 * 100) / 100
  const total = Math.round((cartTotal + tax) * 100) / 100

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    if (form.phone.trim() && !/^[\d\s\-\(\)\+]{7,15}$/.test(form.phone.trim())) errs.phone = 'Invalid phone number'
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Invalid email'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    try {
      // Create order
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          items: cart.map(i => ({ id: i.id, quantity: i.quantity })),
          notes: form.notes
        })
      })

      if (!orderRes.ok) {
        const errorData = await orderRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Error ${orderRes.status}: Failed to place order`);
      }
      const order = await orderRes.json()
      setOrderResult(order)

      // Try Stripe checkout
      try {
        const checkoutRes = await fetch(`${API_URL}/api/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id })
        })

        if (checkoutRes.ok) {
          const { url } = await checkoutRes.json()
          if (url) {
            clearCart()
            window.location.href = url
            return
          }
        }
      } catch (e) {
        console.error('Stripe checkout bypass fallback initiated');
        // Stripe not configured — show confirmation
      }

      clearCart()
      setStep('confirm')
    } catch (error) {
      console.error('Order error:', error)
      setErrors({ submit: error.message || 'Failed to place order. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="order-page">
        <div className="order-confirm container">
          <div className="order-confirm__icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="display-lg">Order Placed!</h1>
          <p className="body-lg text-muted">Your order has been received. We&apos;ll get started right away!</p>
          {orderResult && (
            <div className="order-confirm__details">
              <p><strong>Order ID:</strong> {orderResult.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Total:</strong> ${orderResult.total?.toFixed(2)}</p>
            </div>
          )}
          <Link to="/menu" className="btn btn-primary" style={{marginTop: '2rem'}}>Order More</Link>
        </div>
      </div>
    )
  }

  if (cart.length === 0 && step === 'cart') {
    return (
      <div className="order-page empty-cart-page">
        <div className="order-empty-wrapper container">
          <div className="order-empty-card">
            <div className="order-empty-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1.5"/><circle cx="20" cy="21" r="1.5"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </div>
            <span className="label">Your Basket</span>
            <h1 className="display-md">Your Cart is Empty</h1>
            <p className="body-lg text-muted">A premium culinary experience awaits. Add some hand-crafted signature items to begin.</p>
            <div className="order-empty-actions">
              <Link to="/menu" className="btn btn-primary btn-lg">Explore Our Menu</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="order-page">
      <section className="section bg-soft">
        <div className="container">
          <span className="label">Your Basket</span>
          <h1 className="display-lg">{step === 'cart' ? 'Review Order' : 'Checkout Details'}</h1>
          
          <div className="order-steps" style={{ marginTop: '2rem' }}>
            <div className={`order-step ${step === 'cart' ? 'active' : 'done'}`}>
              <div className="step-bar"></div>
              <span>Basket</span>
            </div>
            <div className={`order-step ${step === 'info' ? 'active' : ''}`}>
              <div className="step-bar"></div>
              <span>Details</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="order-layout">
            <div className="order-main">
              {step === 'cart' && (
                <div className="cart-list">
                  {cart.map(item => (
                    <div className="cart-card" key={item.id}>
                      <div className="cart-card__img">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="cart-card__info">
                        <h3 className="heading-md">{item.name}</h3>
                        <p className="body-sm text-muted">${item.price.toFixed(2)} each</p>
                        <div className="cart-card__controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <div className="cart-card__actions">
                        <span className="cart-card__price">${(item.price * item.quantity).toFixed(2)}</span>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {step === 'info' && (
                <div className="checkout-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                      {errors.name && <span className="form-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-input" type="tel" placeholder="(310) 555-0123" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Email Address (Optional)</label>
                    <input className="form-input" type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>
                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label">Special Instructions</label>
                    <textarea className="form-input" rows="3" placeholder="Gherkins on the side? Let us know." value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  </div>
                  {errors.submit && <div className="form-error global">{errors.submit}</div>}
                </div>
              )}
            </div>

            <div className="order-sidebar">
              <div className="summary-card">
                <h3 className="heading-md">Summary</h3>
                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Order Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="summary-actions">
                  {step === 'cart' ? (
                    <button className="btn btn-primary btn-lg" onClick={() => setStep('info')}>
                      Checkout
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Processing...' : 'Pay with Card'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setStep('cart')}>
                        Back to Basket
                      </button>
                    </>
                  )}
                </div>
                
                <div className="security-note">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Secure Checkout · SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
