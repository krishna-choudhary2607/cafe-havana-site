import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

const SmoothScroll = ({ children }) => {
  const lenisRef = useRef();

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard easing
      direction: 'vertical', 
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // usually keep native scroll for touch devices
      touchMultiplier: 2,
    });
    
    lenisRef.current = lenis;

    // Use requestAnimationFrame for the scroll update loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
