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

function App() {
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
    setIsCartOpen(true);
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
    <ErrorBoundary>
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
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
