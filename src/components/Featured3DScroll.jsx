import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ChevronRight } from 'lucide-react';
import './Featured3DScroll.css';

const featuredItems = [
  { id: 1,  name: 'Garlic Bread Neapolitan',    price: 475,   image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800', ingredients: 'Fresh Basil · Mozzarella · San Marzano Tomatoes · Olive Oil · Artisan Sourdough' },
  { id: 2,  name: 'Farm Fresh Pizza',            price: 695,   image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800', ingredients: 'Bell Peppers · Olives · Onions · Mushrooms · Fresh Mozzarella · Homemade Tomato Sauce' },
  { id: 3,  name: 'Tandoori Paneer Tikka Pizza', price: 695,   image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800', ingredients: 'Tandoori Paneer · Red Onions · Coriander · Mozzarella · Makhani Sauce' },
  { id: 4,  name: 'Creamy White Sauce Pasta',    price: 487.5, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800', ingredients: 'Penne · Heavy Cream · Parmesan · Sweet Corn · Broccoli · Garlic' },
  { id: 5,  name: 'Chili Garlic Noodles',        price: 357.5, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800', ingredients: 'Wok-tossed Noodles · Chili Oil · Burnt Garlic · Scallions · Soy Sauce' },
  { id: 6,  name: 'Mezze Platter',               price: 595,   image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800', ingredients: 'Classic Hummus · Baba Ganoush · Falafel · Pita Bread · Marinated Olives · Feta' },
  { id: 7,  name: 'Crispy Corn',                 price: 375,   image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=800', ingredients: 'Sweet Corn · Crispy Coating · Chaat Masala · Lemon Juice · Coriander' },
  { id: 8,  name: 'Cheese Corn Dumplings',       price: 320,   image: 'https://images.unsplash.com/photo-1528735000313-039ec3a473f0?auto=format&fit=crop&q=80&w=800', ingredients: 'Steamed Dumplings · Cream Cheese · Sweet Corn · Scallions · Chili Dip' },
  { id: 9,  name: 'Bubble Cold Coffee',          price: 275,   image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?auto=format&fit=crop&q=80&w=800', ingredients: 'Espresso · Milk · Ice Cream · Tapioca Boba Pearls · Chocolate Syrup' },
  { id: 10, name: 'Dal Makhani',                 price: 487.5, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800', ingredients: 'Black Lentils · Kidney Beans · Butter · Fresh Cream · Traditional Indian Spices' },
];

const Featured3DScroll = () => {
  const containerRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Horizontal translation
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ['calc(50vw - 160px)', `calc(50vw - 160px - ${(featuredItems.length - 1) * 310}px)`]
  );

  // Progress bar
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <section
        className="signatures-section"
        id="signatures"
        ref={containerRef}
      >
        <div className="signatures-sticky">
          {/* Section Header */}
          <div className="sig-header">
            <span className="section-subtitle">Our Craft</span>
            <h2 className="section-title sig-title">Top 10 Signatures</h2>
            <p className="sig-hint">Scroll to explore →</p>
          </div>

          {/* Horizontal Track */}
          <div className="sig-track-wrapper">
            <motion.div className="sig-track" style={{ x }}>
              {featuredItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  className="sig-card"
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <div className="sig-card-img-wrap">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="sig-card-overlay">
                      <span className="sig-view-label">
                        View Details <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>

                  <div className="sig-card-body">
                    <span className="sig-index">0{i + 1}</span>
                    <h3 className="sig-card-name">{item.name}</h3>
                    <span className="sig-card-price">₹{item.price}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="sig-progress-track">
            <motion.div className="sig-progress-bar" style={{ scaleX }} />
          </div>
        </div>
      </section>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="item-modal-portal">
            <motion.div
              className="item-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
            />
            <motion.div
              className="item-modal-content"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <button className="close-modal-btn" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>

              <div className="item-modal-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>

              <div className="item-modal-info">
                <span className="section-subtitle">Signature Dish</span>
                <h2>{selectedItem.name}</h2>
                <p className="modal-price">₹{selectedItem.price}</p>

                <div className="ingredients-box">
                  <h4>Crafted With</h4>
                  <p>{selectedItem.ingredients}</p>
                </div>

                <button
                  className="btn-primary add-order-btn"
                  onClick={() => {
                    window.location.href = '/order';
                  }}
                >
                  <ShoppingBag size={16} />
                  Order Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Featured3DScroll;
