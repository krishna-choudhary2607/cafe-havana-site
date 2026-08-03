import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col">
          <div className="logo footer-logo">
            <h2>Cafe Havana</h2>
            <span>Jaipur</span>
          </div>
          <p className="footer-about">
            Your slice of heaven on Earth! Sip, savor, and indulge in our cozy ambiance charm.
          </p>
          <div className="social-links">
            <a href="https://instagram.com/havanajaipur" target="_blank" rel="noreferrer" className="social-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><button onClick={() => document.getElementById('home').scrollIntoView({ behavior: 'smooth' })}>Home</button></li>
            <li><button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>About</button></li>
            <li><button onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>Menu</button></li>
            <li><button onClick={() => document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' })}>Reservation</button></li>
            <li><button onClick={() => window.location.href = '/admin'}>Admin Portal</button></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Contact Us</h3>
          <ul className="contact-info">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>NC-701, 7th Floor, R-Tech Capital Highstreet Mall, Jagatpura, Jaipur</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+91 92575 65666</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>hello@cafehavanajaipur.com</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Cafe Havana Jaipur. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
