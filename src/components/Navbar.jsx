import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';

const Navbar = ({ cartCount, onCartClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Experience', id: 'about' },
    { label: 'Menu',       id: 'menu' },
    { label: 'Location',   id: 'location' },
  ];

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : 'transparent'}`}>
      <div className="container navbar-container">
        {/* Logo */}
        <div className="logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="logo-main">Cafe Havana</span>
          <span className="logo-sub">Jaipur</span>
        </div>

        {/* Desktop Nav */}
        <nav className="nav-links desktop-nav">
          {navLinks.map(link => (
            <button key={link.id} className="nav-link" onClick={() => scrollToSection(link.id)}>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="nav-actions">
          <button className="cart-btn" onClick={onCartClick} aria-label="Open cart">
            <ShoppingCart size={20} />
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            className="btn-primary desktop-book"
            onClick={() => scrollToSection('reservation')}
          >
            Book a Table
          </button>

          <button
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.id}
                className="mobile-nav-link"
                onClick={() => scrollToSection(link.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                {link.label}
              </motion.button>
            ))}
            <motion.button
              className="btn-primary mobile-book-btn"
              onClick={() => scrollToSection('reservation')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Book a Table
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
