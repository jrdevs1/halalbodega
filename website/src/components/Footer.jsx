import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer" id="site-footer">
      <div className="footer__glow"></div>
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <img src="/halalbodegalogogreybg.jpg" alt="The Halal Bodega" className="footer__logo" />
            <p className="footer__tagline">Where Street Meets Elite</p>
            <p className="body-sm text-muted" style={{marginTop: '0.75rem', maxWidth: '280px'}}>
              Premium halal smash burgers &amp; loaded fries in the heart of Hollywood.
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <Link to="/" className="footer__link">Home</Link>
            <Link to="/menu" className="footer__link">Menu</Link>
            <Link to="/order" className="footer__link">Order Online</Link>
            <Link to="/about" className="footer__link">About Us</Link>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Location</h4>
            <p className="footer__text">5960 W Sunset Blvd</p>
            <p className="footer__text">Los Angeles, CA 90028</p>
            <p className="footer__text" style={{marginTop: '0.75rem'}}>
              <span className="text-gold">Hours:</span> 12 PM – 12 AM Daily
            </p>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Follow Us</h4>
            <a href="https://instagram.com/thehalalbodega" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Follow us on Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              <span>@thehalalbodega</span>
            </a>
            <a href="https://tiktok.com/@thehalalbodega" target="_blank" rel="noopener noreferrer" className="footer__social" aria-label="Follow us on TikTok">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.19a8.16 8.16 0 004.77 1.53V7.27a4.85 4.85 0 01-1.01-.58z"/></svg>
              <span>@thehalalbodega</span>
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} The Halal Bodega. All rights reserved.
          </p>
          <p className="footer__halal">
            <span className="badge badge-gold">100% Halal Certified</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
