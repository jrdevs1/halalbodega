import { useState, useEffect, useContext } from 'react'
import { CartContext } from '../App'
import { API_URL } from '../App'
import './Menu.css'

const CATEGORIES = [
  { key: 'all', label: 'All Items', icon: '✦' },
  { key: 'burgers', label: 'Smash Burgers', icon: null },
  { key: 'fries', label: 'Loaded Fries', icon: null },
  { key: 'sides', label: 'Sides', icon: null },
  { key: 'drinks', label: 'Drinks', icon: null },
]

export default function Menu() {
  const [items, setItems] = useState([])
  const [active, setActive] = useState('all')
  const [loading, setLoading] = useState(true)
  const [addedId, setAddedId] = useState(null)
  const { addToCart } = useContext(CartContext)

  useEffect(() => {
    document.title = 'Menu — The Halal Bodega'
    fetch(`${API_URL}/api/menu`)
      .then(r => r.json())
      .then(data => { setItems(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = active === 'all' ? items : items.filter(i => i.category === active)

  const handleAdd = (item) => {
    addToCart(item)
    setAddedId(item.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="menu-page">
      <section className="section bg-soft shadow-inner">
        <div className="container">
          <span className="label">Freshly Prepared</span>
          <h1 className="display-lg">The Menu</h1>
          <p className="body-lg text-muted" style={{ maxWidth: '440px' }}>
            Hand-crafted street food with a gourmet edge. Always 100% Halal. Always fresh.
          </p>

          <div className="menu-categories" role="tablist">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`category-tag ${active === cat.key ? 'active' : ''}`}
                onClick={() => setActive(cat.key)}
                role="tab"
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="menu-skeleton-grid">
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="menu-grid">
              {filtered.map(item => (
                <div className="menu-card" key={item.id}>
                  <div className="menu-card__image-container">
                    <img src={item.image} alt={item.name} className="menu-card__img" loading="lazy" />
                  </div>
                  <div className="menu-card__details">
                    <div className="menu-card__header">
                      <h3 className="heading-md">{item.name}</h3>
                      <span className="price">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="body-sm text-muted">{item.description}</p>
                    <div className="menu-card__actions">
                      <button 
                        className={`btn btn-primary btn-sm ${addedId === item.id ? 'btn-success' : ''}`}
                        onClick={() => handleAdd(item)}
                      >
                        {addedId === item.id ? 'Added!' : 'Add to Order'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-5">
              <h2 className="heading-lg text-muted">More Items Coming Soon</h2>
              <button className="btn btn-outline mt-3" onClick={() => setActive('all')}>View All</button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
