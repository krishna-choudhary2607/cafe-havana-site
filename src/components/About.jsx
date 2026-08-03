import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  return (
    <section className="section about" id="about">
      <div className="container about-container">
        <motion.div 
          className="about-image-wrapper"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1000" 
            alt="Cafe Havana Coffee" 
            className="about-img main-img"
          />
          <img 
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1000" 
            alt="Cafe Havana Vibe" 
            className="about-img overlay-img"
          />
        </motion.div>
        
        <motion.div 
          className="about-text"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h2 className="section-title">The Havana Experience</h2>
          <p className="subtitle">Jaipur's first bohemian inspired cafe</p>
          <p>
            Welcome to Cafe Havana, where the city's hustle fades into a haven of earthy tones, Pinterest-worthy corners, and rooftop skies. Located on the 7th floor of Capital Highstreet Mall in Jagatpura, we offer a dynamic ceiling design unlike anywhere else in Jaipur.
          </p>
          <p>
            Whether you're here for our famous Neapolitan Pizzas, creamy pastas, or a perfectly brewed cup of coffee, our multi-cuisine menu is crafted to delight. Unwind in our glass sitting area, enjoy live music, and savor every moment.
          </p>
          <div className="stats">
            <div className="stat-item">
              <h3>4.8★</h3>
              <span>5.5k+ Reviews</span>
            </div>
            <div className="stat-item">
              <h3>2</h3>
              <span>Glorious Years</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
