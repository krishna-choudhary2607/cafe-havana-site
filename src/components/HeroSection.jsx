import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './HeroSection.css';

const HeroSection = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="hero" id="home">
      <motion.div 
        className="hero-bg" 
        style={{ y: y1 }}
      />
      <div className="hero-overlay"></div>
      
      <div className="container hero-content">
        <motion.div 
          className="hero-text"
          style={{ opacity }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            A Slice of Heaven <br/> on Earth
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            Boho vibes, rooftop skies, and delicious culinary experiences in the heart of Jaipur.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <button className="btn-primary" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
              Explore Our Menu
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
