import { Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Order from './pages/Order'
import About from './pages/About'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import OrderSuccess from './pages/OrderSuccess'

export const CartContext = createContext()
export const ThemeContext = createContext()
export const API_URL = import.meta.env.VITE_API_URL || 'https://halalbodega.onrender.com'

function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('halalbodega_cart')
    return saved ? JSON.parse(saved) : []
  })

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('halalbodega_theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('halalbodega_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  useEffect(() => {
    localStorage.setItem('halalbodega_cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.min(20, quantity) } : i))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
        <div className="app">
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={
              <>
                <Navbar />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/order" element={<Order />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                  </Routes>
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </CartContext.Provider>
    </ThemeContext.Provider>
  )
}

export default App
