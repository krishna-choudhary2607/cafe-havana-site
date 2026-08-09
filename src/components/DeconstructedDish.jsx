import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './DeconstructedDish.css';

const DeconstructedDish = () => {
  const containerRef = useRef(null);
  
  // Track scroll progress through this specific 300vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // Animation segments:
  // 0.0 - 0.2: Sticky starts, layers begin to separate
  // 0.2 - 0.6: Layers are fully separated, text fades in
  // 0.6 - 0.8: Layers stay separated
  // 0.8 - 1.0: Layers combine back together and scroll releases

  // Layer 1: Foam (Moves UP)
  const foamY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, -180, -180, 0]);
  const foamOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 1, 1, 1]);
  
  // Layer 2: Espresso (Moves slightly UP)
  const espressoY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, -60, -60, 0]);
  
  // Layer 3: Milk (Moves slightly DOWN)
  const milkY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 60, 60, 0]);

  // Layer 4: Glass Base (Moves DOWN)
  const baseY = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 180, 180, 0]);

  // Text fading logic (only visible when separated)
  const textOpacity = useTransform(scrollYProgress, [0.15, 0.25, 0.75, 0.85], [0, 1, 1, 0]);

  return (
    <section className="deconstruct-section" ref={containerRef}>
      <div className="deconstruct-sticky">
        
        <div className="deconstruct-header">
          <span className="section-subtitle">The Anatomy of</span>
          <h2 className="section-title">Our Signature Latte</h2>
        </div>

        <div className="deconstruct-canvas">
          
          {/* Layer 1: Foam */}
          <motion.div className="layer-wrapper" style={{ y: foamY, zIndex: 4 }}>
            <div className="layer-content foam-layer">
              <div className="layer-shape foam-shape"></div>
            </div>
            <motion.div className="layer-label label-left" style={{ opacity: textOpacity }}>
              <h4>Micro-Foam</h4>
              <p>Velvety textured milk poured with precision</p>
            </motion.div>
          </motion.div>

          {/* Layer 2: Espresso */}
          <motion.div className="layer-wrapper" style={{ y: espressoY, zIndex: 3 }}>
            <motion.div className="layer-label label-right" style={{ opacity: textOpacity }}>
              <h4>Double Espresso</h4>
              <p>100% Arabica, rich dark roast</p>
            </motion.div>
            <div className="layer-content espresso-layer">
              <div className="layer-shape espresso-shape"></div>
            </div>
          </motion.div>

          {/* Layer 3: Milk */}
          <motion.div className="layer-wrapper" style={{ y: milkY, zIndex: 2 }}>
            <div className="layer-content milk-layer">
              <div className="layer-shape milk-shape"></div>
            </div>
            <motion.div className="layer-label label-left" style={{ opacity: textOpacity }}>
              <h4>Steamed Milk</h4>
              <p>Locally sourced, heated to 65°C</p>
            </motion.div>
          </motion.div>

          {/* Layer 4: Base */}
          <motion.div className="layer-wrapper" style={{ y: baseY, zIndex: 1 }}>
            <motion.div className="layer-label label-right" style={{ opacity: textOpacity }}>
              <h4>Handcrafted Glass</h4>
              <p>Double-walled to preserve heat</p>
            </motion.div>
            <div className="layer-content base-layer">
              <div className="layer-shape base-shape"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default DeconstructedDish;
