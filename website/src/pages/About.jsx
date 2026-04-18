import { useEffect, useRef } from 'react'
import './About.css'

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

export default function About() {
  const ref1 = useReveal()
  const ref2 = useReveal()
  const ref3 = useReveal()

  useEffect(() => {
    document.title = 'About — The Halal Bodega'
  }, [])

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero__bg"></div>
        <div className="container about-hero__content">
          <span className="label">Our Story</span>
          <h1 className="display-xl">Where Street<br /><span className="text-gold">Meets Elite</span></h1>
          <p className="body-lg text-muted" style={{maxWidth: '560px'}}>
            Premium halal street food in the heart of Hollywood. Born from passion, built for everyone.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="section" ref={ref1}>
        <div className="container reveal">
          <div className="about-story">
            <div className="about-story__content">
              <span className="label">The Beginning</span>
              <h2 className="heading-lg">More Than Just<br /><span className="text-gold">A Burger Spot</span></h2>
              <p className="body-lg text-muted">
                The Halal Bodega was born from a simple idea: everyone deserves access to 
                premium, halal-certified street food that doesn&apos;t compromise on quality or taste.
              </p>
              <p className="body-lg text-muted">
                Our hand-smashed burgers are crafted to order with 100% halal beef, fresh-cut 
                jalapeños, and our signature bodega sauce that took months of perfecting. Every 
                batch of fries is hand-cut daily, not from frozen bags.
              </p>
              <p className="body-lg text-muted">
                Located on the legendary Sunset Boulevard, we&apos;re bringing a new energy to 
                Hollywood&apos;s food scene — street food with a luxury twist.
              </p>
            </div>
            <div className="about-story__visual">
              <div className="about-story__image-stack">
                <img src="/burger.png" alt="The Halal Bodega signature smash burger" className="about-story__img about-story__img--1" loading="lazy" />
                <img src="/fries.png" alt="Loaded fries" className="about-story__img about-story__img--2" loading="lazy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section about-values-section" ref={ref2}>
        <div className="container reveal">
          <div className="section-header">
            <span className="label">What We Stand For</span>
            <h2 className="display-lg">Our Promise</h2>
          </div>
          <div className="about-values">
            <div className="about-value">
              <div className="about-value__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3 className="heading-md">100% Halal</h3>
              <p className="body-sm text-muted">Every ingredient, every supplier, fully halal certified. No compromises, ever.</p>
            </div>
            <div className="about-value">
              <div className="about-value__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              </div>
              <h3 className="heading-md">Premium Quality</h3>
              <p className="body-sm text-muted">Hand-smashed to order, never frozen. Fresh-cut fries daily. Premium ingredients only.</p>
            </div>
            <div className="about-value">
              <div className="about-value__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="heading-md">Community First</h3>
              <p className="body-sm text-muted">Built for the community, by the community. Everyone is welcome at our table.</p>
            </div>
            <div className="about-value">
              <div className="about-value__icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 className="heading-md">Made Fresh</h3>
              <p className="body-sm text-muted">Every order is made from scratch when you order it. That&apos;s the bodega way.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="section" ref={ref3}>
        <div className="container reveal">
          <div className="about-location">
            <div className="about-location__info">
              <span className="label">Find Us</span>
              <h2 className="heading-lg">Visit The Bodega</h2>
              <div className="about-location__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <div>
                  <p className="body-lg">5960 W Sunset Blvd</p>
                  <p className="text-muted">Los Angeles, CA 90028</p>
                </div>
              </div>
              <div className="about-location__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <div>
                  <p className="body-lg">Open Daily</p>
                  <p className="text-muted">12:00 PM – 12:00 AM</p>
                </div>
              </div>
              <div className="about-location__detail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <div>
                  <p className="body-lg">Grand Opening</p>
                  <p className="text-muted">April 18, 2026 at 12:00 PM</p>
                </div>
              </div>

              <div className="about-location__social">
                <a href="https://instagram.com/thehalalbodega" target="_blank" rel="noopener noreferrer" className="about-social-link" aria-label="Instagram">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <span>@thehalalbodega</span>
                </a>
                <a href="https://tiktok.com/@thehalalbodega" target="_blank" rel="noopener noreferrer" className="about-social-link" aria-label="TikTok">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.19a8.16 8.16 0 004.77 1.53V7.27a4.85 4.85 0 01-1.01-.58z"/></svg>
                  <span>@thehalalbodega</span>
                </a>
              </div>
            </div>
            <div className="about-location__map">
              <iframe
                title="The Halal Bodega location map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3303.6!2d-118.325!3d34.097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDA1JzQ5LjIiTiAxMTjCsDE5JzMwLjAiVw!5e0!3m2!1sen!2sus!4v1"
                width="100%"
                height="400"
                style={{border: 0, borderRadius: '12px'}}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
