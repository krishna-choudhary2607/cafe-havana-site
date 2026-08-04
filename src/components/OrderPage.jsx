import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import Cart from './Cart';
import './OrderPage.css';
import { Plus } from 'lucide-react';

const menuItems = [
  { id: 1, name: 'Garlic Bread Neapolitan', price: 475, category: 'Italian', image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'Farm Fresh Pizza', price: 695, category: 'Italian', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Tandoori Paneer Tikka Pizza', price: 695, category: 'Italian', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Creamy White Sauce Pasta', price: 487.5, category: 'Italian', image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=600' },
  { id: 5, name: 'Chili Garlic Noodles', price: 357.5, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600' },
  { id: 6, name: 'Hakka Noodles', price: 331.5, category: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600' },
  { id: 7, name: 'Cheese Corn Dumplings', price: 320, category: 'Chinese', image: 'https://images.unsplash.com/photo-1528735000313-039ec3a473f0?auto=format&fit=crop&q=80&w=600' },
  { id: 8, name: 'Mezze Platter', price: 595, category: 'Starters', image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=600' },
  { id: 9, name: 'Crispy Corn', price: 375, category: 'Starters', image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=600' },
  { id: 10, name: 'Dal Makhani', price: 487.5, category: 'Indian', image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600' },
  { id: 11, name: 'Bubble Cold Coffee', price: 275, category: 'Beverages', image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?auto=format&fit=crop&q=80&w=600' },
  { id: 12, name: 'Chai', price: 150, category: 'Beverages', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=600' },
];

const categories = ['All', 'Italian', 'Chinese', 'Indian', 'Starters', 'Beverages'];

const OrderPage = () => {
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table');
  const token = searchParams.get('token');

  const [activeCategory, setActiveCategory] = useState('All');
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

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="order-page">
      <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} onCartClick={() => setIsCartOpen(true)} />
      
      <div className="order-container">
        <div className="order-header">
          <h2>Order Food</h2>
          {table && <span className="table-badge-large">Table {table}</span>}
        </div>
        
        <div className="order-categories">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="order-list">
          {filteredItems.map((item) => (
            <div key={item.id} className="order-item-row">
              <div className="item-img-container">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h4>{item.name}</h4>
                <span className="price">₹{item.price}</span>
              </div>
              <div className="item-action">
                <button className="add-btn" onClick={() => addToCart(item)}>
                  <Plus size={16} /> ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
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
};

export default OrderPage;
