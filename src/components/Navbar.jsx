import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`navbar ${isScrolled ? 'glass-dark scrolled' : 'transparent'}`}>
      <div className="container navbar-container">
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <h2>Cafe Havana</h2>
          <span>Jaipur</span>
        </div>

        <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
          <button className="nav-link" onClick={() => scrollToSection('about')}>About</button>
          <button className="nav-link" onClick={() => scrollToSection('menu')}>Menu</button>
          <button className="nav-link" onClick={() => scrollToSection('reservation')}>Reservation</button>
        </nav>

        <div className="nav-actions">
          <button className="cart-btn" onClick={onCartClick}>
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button className="btn-primary desktop-book" onClick={() => scrollToSection('reservation')}>
            Book a Table
          </button>
          <button className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
