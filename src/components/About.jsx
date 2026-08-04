import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import './About.css';

const stats = [
  { value: '4.8★', label: '5.5k+ Reviews' },
  { value: '2+',   label: 'Years of Joy' },
  { value: '50+',  label: 'Menu Items' },
  { value: '7th',  label: 'Floor Rooftop' },
];

const About = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const imgY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section className="about-section section" id="about" ref={ref}>
      <div className="container about-container">
        {/* Images Column */}
        <motion.div
          className="about-images"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="about-img-main-wrap">
            <motion.img
              style={{ y: imgY }}
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=900"
              alt="Cafe Havana Coffee"
              className="about-img-main"
            />
          </div>
          <motion.div
            className="about-img-accent-wrap"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img
              src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600"
              alt="Cafe Havana Atmosphere"
              className="about-img-accent"
            />
          </motion.div>

          {/* Floating badge */}
          <motion.div
            className="about-badge"
            initial={{ opacity: 0, scale: 0.7 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6, type: 'spring', stiffness: 200 }}
          >
            <span className="about-badge-num">4.8</span>
            <span className="about-badge-label">Google Rating</span>
          </motion.div>
        </motion.div>

        {/* Text Column */}
        <motion.div
          className="about-text"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <span className="section-subtitle">Our Story</span>
          <h2 className="section-title about-title">The Havana<br /><em>Experience</em></h2>
          <div className="gold-line" style={{ marginBottom: 28 }} />

          <p className="about-body">
            Welcome to Cafe Havana — where the city's hustle fades into a haven of earthy tones,
            Pinterest-worthy corners, and rooftop skies. Located on the <strong>7th floor of Capital
            Highstreet Mall</strong> in Jagatpura, Jaipur, we offer a dynamic ceiling design unlike
            anywhere else in the city.
          </p>

          <p className="about-body">
            Whether you're here for our famous Neapolitan Pizzas, creamy pastas, or a
            perfectly brewed cup of coffee — our multi-cuisine menu is crafted to delight.
            Unwind in our glass sitting area, enjoy live music, and savour every moment.
          </p>

          {/* Stats */}
          <div className="about-stats">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className="stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              >
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
