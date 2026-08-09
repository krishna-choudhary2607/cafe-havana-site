import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import './HeroSection.css';

const wordVariant = {
  hidden: { y: '100%', opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.9, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const HeroSection = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const bgY   = useTransform(scrollY, [0, 600], [0, 180]);
  const textOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const textY = useTransform(scrollY, [0, 400], [0, 60]);

  const line1 = ['A', 'Slice', 'of', 'Heaven'];
  const line2 = ['on', 'Earth'];

  // 3D text effect based on mouse
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Use springs for smooth interpolation
  const rotateX = useSpring(mousePos.y * -15, { damping: 30, stiffness: 100 });
  const rotateY = useSpring(mousePos.x * 15, { damping: 30, stiffness: 100 });

  return (
    <section className="hero" id="home" ref={ref}>
      {/* Parallax background */}
      <motion.div className="hero-bg" style={{ y: bgY }} />

      {/* Gradient overlays */}
      <div className="hero-overlay-top" />
      <div className="hero-overlay-bottom" />

      {/* Content */}
      <motion.div
        className="container hero-content"
        style={{ opacity: textOpacity, y: textY }}
      >
        <motion.span
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Jaipur's Bohemian Rooftop Café
        </motion.span>

        <motion.h1 
          className="hero-title"
          style={{ 
            rotateX, 
            rotateY,
            perspective: 1000,
            transformStyle: "preserve-3d" 
          }}
        >
          <span className="hero-line" style={{ transform: "translateZ(40px)" }}>
            {line1.map((word, i) => (
              <span key={i} className="word-mask">
                <motion.span
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariant}
                  className="word"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
          <span className="hero-line italic-line" style={{ transform: "translateZ(80px)" }}>
            {line2.map((word, i) => (
              <span key={i} className="word-mask">
                <motion.span
                  custom={i + line1.length}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariant}
                  className="word"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </motion.h1>

        <motion.p
          className="hero-desc"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
        >
          Boho vibes, rooftop skies & multi-cuisine artistry
          <br />in the heart of Jaipur.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
        >
          <button
            className="btn-primary"
            onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
          >
            Explore Menu
          </button>
          <button
            className="btn-outline"
            onClick={() => document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' })}
          >
            Book a Table
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
        <span>Scroll</span>
      </motion.div>
    </section>
  );
};

export default HeroSection;
