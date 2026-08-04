import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import './Menu.css';

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

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section className="section menu" id="menu">
      <div className="container">
        <motion.div 
          className="menu-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="section-title text-center">Our Culinary Canvas</h2>
          <p className="subtitle text-center">Savor the artistry in every bite</p>
          
          <div className="category-filters">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div layout className="menu-grid">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="menu-card"
              >
                <div className="menu-img-wrap">
                  <img src={item.image} alt={item.name} className="menu-item-img" />
                </div>
                <div className="menu-info">
                  <div className="menu-title-row">
                    <h3>{item.name}</h3>
                    <span className="price">₹{item.price}</span>
                  </div>
                  <span className="category-tag">{item.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default Menu;
