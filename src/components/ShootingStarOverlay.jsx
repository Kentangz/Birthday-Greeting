import React, { useState, useEffect } from 'react';
import './ShootingStar.css'; 

const Star = ({ delay, duration }) => {
  const style = {
    top: `${Math.random() * 40 - 20}%`,
    right: `${Math.random() * 40 - 20}%`,
    animationName: 'fall',
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  };

  return <div className="shooting-star" style={style}></div>;
};

const ShootingStarOverlay = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        delay: Math.random() * 10,
        duration: Math.random() * 2 + 1,
      }));
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="star-overlay">
      {stars.map(star => (
        <Star key={star.id} delay={star.delay} duration={star.duration} />
      ))}
    </div>
  );
};

export default ShootingStarOverlay;