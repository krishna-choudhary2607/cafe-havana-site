import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import './Menu.css';

const menuItems = [
  { id: 1,  name: 'Garlic Bread Neapolitan',    price: 475,   category: 'Italian',   image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=600' },
  { id: 2,  name: 'Farm Fresh Pizza',            price: 695,   category: 'Italian',   image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600' },
  { id: 3,  name: 'Tandoori Paneer Tikka Pizza', price: 695,   category: 'Italian',   image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600' },
  { id: 4,  name: 'Creamy White Sauce Pasta',    price: 487.5, category: 'Italian',   image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=600' },
  { id: 5,  name: 'Chili Garlic Noodles',        price: 357.5, category: 'Chinese',   image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600' },
  { id: 6,  name: 'Hakka Noodles',               price: 331.5, category: 'Chinese',   image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600' },
  { id: 7,  name: 'Cheese Corn Dumplings',        price: 320,   category: 'Chinese',   image: 'https://images.unsplash.com/photo-1528735000313-039ec3a473f0?auto=format&fit=crop&q=80&w=600' },
  { id: 8,  name: 'Mezze Platter',               price: 595,   category: 'Starters',  image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=600' },
  { id: 9,  name: 'Crispy Corn',                 price: 375,   category: 'Starters',  image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=600' },
  { id: 10, name: 'Dal Makhani',                 price: 487.5, category: 'Indian',    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=600' },
  { id: 11, name: 'Bubble Cold Coffee',          price: 275,   category: 'Beverages', image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?auto=format&fit=crop&q=80&w=600' },
  { id: 12, name: 'Chai',                        price: 150,   category: 'Beverages', image: 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?auto=format&fit=crop&q=80&w=600' },
];

const categories = ['All', 'Italian', 'Chinese', 'Indian', 'Starters', 'Beverages'];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.25 } },
};

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section className="menu-section section" id="menu">
      <div className="container">
        <motion.div
          className="menu-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-subtitle">Culinary Canvas</span>
          <h2 className="section-title text-center">Our Menu</h2>
          <div className="gold-line centered" />
          <p className="section-desc text-center" style={{ margin: '16px auto 40px' }}>
            From Neapolitan pizzas to perfectly brewed chai — crafted to delight.
          </p>

          {/* Category Filters */}
          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.span className="filter-active-bg" layoutId="filter-pill" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <motion.div layout className="menu-grid">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="menu-card"
              >
                <div className="menu-img-wrap">
                  <img src={item.image} alt={item.name} loading="lazy" />
                  <div className="menu-img-overlay">
                    <a href="/order" className="menu-quick-order">
                      <Plus size={16} /> Order
                    </a>
                  </div>
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-top">
                    <span className="menu-category-tag">{item.category}</span>
                  </div>
                  <h3 className="menu-item-name">{item.name}</h3>
                  <div className="menu-card-bottom">
                    <span className="menu-price">₹{item.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="menu-cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <a href="/order" className="btn-primary">
            View Full Menu & Order
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Menu;
