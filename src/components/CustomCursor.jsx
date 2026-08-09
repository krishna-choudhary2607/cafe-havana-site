import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CustomCursor.css';

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      // Check if we are hovering over clickable elements
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Use spring physics for smoother follow
  const variants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      scale: 1,
      backgroundColor: 'rgba(201, 150, 63, 0.5)', // Accent color (gold)
      border: '1px solid rgba(201, 150, 63, 0.8)',
    },
    hover: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      scale: 1.5,
      backgroundColor: 'transparent',
      border: '2px solid rgba(201, 150, 63, 1)',
    },
  };

  // Hide cursor on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <motion.div
      className="custom-cursor"
      variants={variants}
      animate={isHovering ? 'hover' : 'default'}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 28,
        mass: 0.5,
      }}
    />
  );
};

export default CustomCursor;
