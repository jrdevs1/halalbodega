import { useEffect, useRef, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from '../App'
import { API_URL } from '../App'
import gsap from 'gsap'
import './Home.css'

// ===== 3D Particle Scene =====
function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    const PARTICLE_COUNT = 80

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    class Particle {
      constructor() {
        this.reset()
      }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.1
        this.color = Math.random() > 0.6 ? '#D4A853' : '#F5F0E8'
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }
    }

    function init() {
      resize()
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle())
    }

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(212, 168, 83, ${0.08 * (1 - dist / 150)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      drawLines()
      animId = requestAnimationFrame(animate)
    }

    init()
    animate()
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
}

function Countdown() {
  const [timeLeft, setTimeLeft] = useState({})
  
  useEffect(() => {
    const grandOpening = new Date('2026-04-18T12:00:00-07:00')
    function calc() {
      const now = new Date()
      const diff = grandOpening - now
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        passed: false
      }
    }
    setTimeLeft(calc())
    const timer = setInterval(() => setTimeLeft(calc()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (timeLeft.passed === undefined) return null

  if (timeLeft.passed) {
    return (
      <div className="countdown countdown--open">
        <div className="countdown__live">
          <span className="countdown__pulse"></span>
          <span>WE ARE NOW OPEN!</span>
        </div>
      </div>
    )
  }

  return (
    <div className="countdown" aria-label="Countdown to grand opening">
      <div className="countdown__header">
        <span className="label">Grand Opening</span>
        <h2 className="display-md">Counting Down</h2>
      </div>
      <div className="countdown__grid">
        {[
          { val: timeLeft.days, label: 'Days' },
          { val: timeLeft.hours, label: 'Hours' },
          { val: timeLeft.minutes, label: 'Minutes' },
          { val: timeLeft.seconds, label: 'Seconds' }
        ].map(({ val, label }, idx) => (
          <div className="countdown__unit card-dark" key={label} style={{ animationDelay: `${idx * 0.1}s` }}>
            <span className="countdown__number">{String(val ?? 0).padStart(2, '0')}</span>
            <span className="countdown__label">{label}</span>
          </div>
        ))}
      </div>
      <p className="countdown__date">April 18, 2026 &middot; 12:00 PM</p>
    </div>
  )
}

// ===== Scroll Reveal Hook =====
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible') },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

// ===== Home Page =====
export default function Home() {
  const { addToCart } = useContext(CartContext)
  const [featured, setFeatured] = useState([])
  const burgerRef = useRef(null)
  const heroRef = useRef(null)
  
  const reveal1 = useReveal()
  const reveal2 = useReveal()
  const reveal3 = useReveal()
  const reveal4 = useReveal()

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 }})
      tl.from('.hero__content > *', { y: 60, opacity: 0, stagger: 0.15 })
        .from('.hero__image', { scale: 0.8, opacity: 0, rotate: -10 }, '-=1')
    }, heroRef)

    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!burgerRef.current) return
      const { clientX, clientY } = e
      const xPos = (clientX / window.innerWidth - 0.5) * 30
      const yPos = (clientY / window.innerHeight - 0.5) * 30
      
      gsap.to(burgerRef.current, {
        x: xPos,
        y: yPos,
        rotateX: -yPos / 2,
        rotateY: xPos / 2,
        duration: 1,
        ease: 'power2.out'
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/api/menu`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFeatured(data.filter(i => i.sort_order === 1).slice(0, 3))
        }
      })
      .catch(() => {
        setFeatured([
          { id: 'b3ba35a9-fcca-4bf7-ba50-297758191163', name: 'The OG Smash', description: 'Hand-smashed halal beef with melted cheese and our signature bodega sauce', price: 12.99, image: '/burger.png', category: 'burgers' },
          { id: '1c9fdd7c-15c5-46cc-93bd-3855457c6a65', name: 'Smash Loaded Fries', description: 'Golden fries loaded with smashed beef, cheese, and all the sauces', price: 14.99, image: '/fries.png', category: 'fries' },
          { id: '4a1db37f-140c-49e7-a2b4-84a82316aeb9', name: 'Salaam Cola', description: 'Premium halal-certified cola — ice cold and refreshing', price: 3.49, image: '/drink.png', category: 'drinks' },
        ])
      })
  }, [])

  return (
    <div className="home">
      {/* ===== High-End Hero ===== */}
      <section className="hero" ref={heroRef}>
        <HeroCanvas />
        <div className="container hero__grid">
          <div className="hero__content">
            <span className="label">Hollywood Signature</span>
            <h1 className="display-xl">
              The Halal<br /><span className="text-gold">Bodega</span>
            </h1>
            <p className="body-lg text-muted" style={{ maxWidth: '400px', margin: '1.5rem 0' }}>
              Premium halal ingredients meets Hollywood street culture. Hand-crafted, smashed to perfection.
            </p>
            <div className="hero__actions">
              <Link to="/order" className="btn btn-primary">Start Order</Link>
              <Link to="/menu" className="btn btn-outline">Explore Menu</Link>
            </div>
          </div>

          <div className="hero__image">
            <img 
              ref={burgerRef}
              src="/burger.png" 
              alt="The Halal Bodega signature smash burger" 
              className="hero__burger-img" 
            />
            <div className="hero__img-blob"></div>
          </div>
        </div>
        
        <div className="hero__scroll">
          <span>Scroll to Discover</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      {/* ===== Countdown Section ===== */}
      <section className="section bg-soft shadow-inner">
        <div className="container reveal" ref={reveal1}>
          <Countdown />
        </div>
      </section>

      {/* ===== Fan Favorites ===== */}
      <section className="section">
        <div className="container reveal" ref={reveal2}>
          <div className="section-header text-center">
            <span className="label">Freshly Made</span>
            <h2 className="display-lg">Fan Favorites</h2>
            <div className="header-line"></div>
          </div>

          <div className="featured-grid">
            {featured.map((item, idx) => (
              <div className="featured-card" key={item.id}>
                <div className="featured-card__image-container">
                  <img src={item.image} alt={item.name} className="featured-card__img" loading="lazy" />
                </div>
                <div className="featured-card__info">
                  <h3 className="heading-md">{item.name}</h3>
                  <p className="body-sm text-muted">{item.description}</p>
                  <div className="featured-card__cta">
                    <span className="price">${item.price.toFixed(2)}</span>
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Minimalist About ===== */}
      <section className="section bg-soft">
        <div className="container about-grid reveal" ref={reveal3}>
          <div className="about-visual">
            <img src="/fries.png" alt="Halal loaded fries" className="about-img" />
          </div>
          <div className="about-text">
            <span className="label">Our Craft</span>
            <h2 className="display-lg">Quality You<br /><span className="text-gold">Can Taste.</span></h2>
            <p className="body-lg text-muted">
              We focus on the essentials: high-quality halal meats, fresh produce from local markets, and a smashing technique perfected on the streets of LA.
            </p>
            <div className="about-features">
              <div className="feature-item">
                <strong>100%</strong>
                <span>Certified Halal</span>
              </div>
              <div className="feature-item">
                <strong>Always</strong>
                <span>Fresh, Never Frozen</span>
              </div>
            </div>
            <Link to="/about" className="btn btn-outline">Our Full Story</Link>
          </div>
        </div>
      </section>

      {/* ===== Modern CTA ===== */}
      <section className="section">
        <div className="container reveal" ref={reveal4}>
          <div className="modern-cta">
            <div className="cta-content">
              <span className="label">Ready?</span>
              <h2 className="display-lg">Taste the Difference</h2>
              <p className="body-lg text-muted">Your order is prepared fresh on Sunset Blvd.</p>
              <Link to="/order" className="btn btn-primary">Order Now</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
