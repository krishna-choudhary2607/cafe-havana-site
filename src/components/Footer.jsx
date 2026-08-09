import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);
import './Footer.css';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const Footer = () => (
  <footer className="footer" id="location">
    <div className="footer-top-line" />
    <div className="container footer-inner">
      {/* Brand */}
      <div className="footer-col footer-brand">
        <div className="footer-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="footer-logo-main">Cafe Havana</span>
          <span className="footer-logo-sub">Jaipur</span>
        </div>
        <p className="footer-tagline">
          Your slice of heaven on Earth.<br />
          Sip, savour, and linger awhile.
        </p>
        <a
          href="https://instagram.com/havanajaipur"
          target="_blank"
          rel="noreferrer"
          className="footer-insta"
          aria-label="Instagram"
        >
          <InstagramIcon />
          <span>@havanajaipur</span>
        </a>
      </div>

      {/* Navigation */}
      <div className="footer-col">
        <h4 className="footer-heading">Explore</h4>
        <ul className="footer-links">
          {[
            { label: 'Home',        id: 'home' },
            { label: 'Our Story',   id: 'about' },
            { label: 'Menu',        id: 'menu' },
            { label: 'Reservation', id: 'reservation' },
          ].map(l => (
            <li key={l.id}>
              <button onClick={() => scrollTo(l.id)}>{l.label}</button>
            </li>
          ))}
          <li><button onClick={() => window.location.href = '/admin'}>Admin Portal</button></li>
        </ul>
      </div>

      {/* Contact */}
      <div className="footer-col">
        <h4 className="footer-heading">Find Us</h4>
        <ul className="footer-contact">
          <li>
            <MapPin size={15} />
            <span>NC-701, 7th Floor, Capital Highstreet Mall, Jagatpura, Jaipur</span>
          </li>
          <li>
            <Phone size={15} />
            <a href="tel:+919257565666">+91 92575 65666</a>
          </li>
          <li>
            <Mail size={15} />
            <a href="mailto:hello@cafehavanajaipur.com">hello@cafehavanajaipur.com</a>
          </li>
        </ul>
        <div className="footer-hours">
          <span className="footer-hours-label">Hours</span>
          <span>Mon – Sun &nbsp;9:00 AM – 11:30 PM</span>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Cafe Havana Jaipur. All rights reserved.</p>
      <p className="footer-credit">Crafted with ♥ in Jaipur</p>
    </div>
  </footer>
);

export default Footer;
