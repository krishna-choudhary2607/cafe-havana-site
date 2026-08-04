import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import './Featured3DScroll.css';

const featuredItems = [
  { 
    id: 1, name: 'Garlic Bread Neapolitan', price: 475, 
    image: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Fresh Basil, Mozzarella, San Marzano Tomatoes, Olive Oil, Garlic, Artisan Sourdough'
  },
  { 
    id: 2, name: 'Farm Fresh Pizza', price: 695, 
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Bell Peppers, Olives, Onions, Mushrooms, Fresh Mozzarella, Homemade Tomato Sauce'
  },
  { 
    id: 3, name: 'Tandoori Paneer Tikka Pizza', price: 695, 
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Tandoori Marinated Paneer, Red Onions, Coriander, Mozzarella, Makhani Sauce'
  },
  { 
    id: 4, name: 'Creamy White Sauce Pasta', price: 487.5, 
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Penne Pasta, Heavy Cream, Parmesan, Sweet Corn, Broccoli, Garlic, Oregano'
  },
  { 
    id: 5, name: 'Chili Garlic Noodles', price: 357.5, 
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Wok-tossed Noodles, Chili Oil, Burnt Garlic, Scallions, Soy Sauce, Capsicum'
  },
  { 
    id: 6, name: 'Mezze Platter', price: 595, 
    image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Classic Hummus, Baba Ganoush, Falafel, Pita Bread, Marinated Olives, Feta'
  },
  { 
    id: 7, name: 'Crispy Corn', price: 375, 
    image: 'https://images.unsplash.com/photo-1590165482129-1b8b27698780?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Sweet Corn Kernels, Crispy Coating, Chaat Masala, Lemon Juice, Coriander'
  },
  { 
    id: 8, name: 'Cheese Corn Dumplings', price: 320, 
    image: 'https://images.unsplash.com/photo-1528735000313-039ec3a473f0?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Steamed Dumplings, Cream Cheese, Sweet Corn, Scallions, Chili Dip'
  },
  { 
    id: 9, name: 'Bubble Cold Coffee', price: 275, 
    image: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Espresso, Milk, Ice Cream, Tapioca Boba Pearls, Chocolate Syrup'
  },
  { 
    id: 10, name: 'Dal Makhani', price: 487.5, 
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800',
    ingredients: 'Black Lentils, Kidney Beans, Butter, Fresh Cream, Traditional Indian Spices'
  },
];

const Featured3DScroll = () => {
  const containerRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Helix Math
  const itemsCount = featuredItems.length;
  const isMobile = window.innerWidth < 768;
  // Ring Carousel Math
  const radius = isMobile ? 220 : 380;
  const angleStep = 360 / itemsCount;
  const yStep = 0;
  
  const totalAngle = 360;

  // The container rotates to bring each item to the front
  const helixRotateY = useTransform(scrollYProgress, [0, 1], [0, totalAngle]);
  const helixTranslateY = 0;

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  return (
    <>
      <div className="featured-3d-container" ref={containerRef}>
        <div className="sticky-wrapper">
          <div className="title-3d-wrap">
             <h2 className="section-title text-center" style={{ margin: 0 }}>
               Our Top 10 Signatures
             </h2>
          </div>
          
          <div className="perspective-container">
            <motion.div 
              className="helix-container"
              style={{
                rotateY: helixRotateY,
                y: helixTranslateY
              }}
            >
              {featuredItems.map((item, index) => {
                const itemAngle = index * -angleStep;
                const itemY = index * yStep;

                return (
                  <div 
                    key={item.id} 
                    className="card-3d"
                    onClick={() => handleItemClick(item)}
                    style={{
                      transform: `rotateY(${itemAngle}deg) translateZ(${radius}px) translateY(${itemY}px)`
                    }}
                  >
                    <div className="card-image-wrap">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="card-content">
                      <h3>{item.name}</h3>
                      <span className="price">₹{item.price}</span>
                      <p className="click-hint">Click for details</p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

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
              className="item-modal-content glass-dark"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
            >
              <button className="close-modal-btn" onClick={() => setSelectedItem(null)}>
                <X size={24} />
              </button>
              
              <div className="item-modal-image">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>
              
              <div className="item-modal-info">
                <h2>{selectedItem.name}</h2>
                <span className="modal-price">₹{selectedItem.price}</span>
                
                <div className="ingredients-box">
                  <h4>Ingredients</h4>
                  <p>{selectedItem.ingredients}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Featured3DScroll;
