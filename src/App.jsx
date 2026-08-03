import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Featured3DScroll from './components/Featured3DScroll';
import About from './components/About';
import Menu from './components/Menu';
import Reservation from './components/Reservation';
import Footer from './components/Footer';
import Cart from './components/Cart';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import AdminPortal from './components/Admin/AdminPortal';

function CafeSite() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    // Removed setIsCartOpen(true) so cart doesn't pop open on every tap
  };
  
  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id, delta) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  return (
    <div className="app">
      <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
      
      <main>
        <HeroSection />
        <Featured3DScroll onAddToCart={addToCart} />
        <About />
        <Menu onAddToCart={addToCart} />
        <Reservation />
      </main>

      <Footer />
      
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        clearCart={() => setCartItems([])}
      />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<CafeSite />} />
          <Route path="/admin" element={<AdminPortal />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
