// src/components/ShootingStarOverlay.jsx

import React, { useState, useEffect } from 'react';
import './ShootingStar.css'; // Kita akan buat file CSS ini

// Komponen untuk satu bintang jatuh
const Star = ({ delay, duration }) => {
  const style = {
    // Posisi awal acak di kanan atas
    top: `${Math.random() * 40 - 20}%`, // Muncul dari -20% hingga 20% dari atas
    right: `${Math.random() * 40 - 20}%`,// Muncul dari -20% hingga 20% dari kanan
    // Animasi dengan durasi & delay acak
    animationName: 'fall',
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`,
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  };

  return <div className="shooting-star" style={style}></div>;
};


// Komponen utama untuk mengelola banyak bintang
const ShootingStarOverlay = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Buat beberapa bintang dengan properti acak
    const generateStars = () => {
      const newStars = Array.from({ length: 5 }).map((_, i) => ({
        id: i,
        // Delay acak agar tidak muncul bersamaan
        delay: Math.random() * 10, 
        // Durasi acak agar kecepatan bervariasi
        duration: Math.random() * 2 + 1, // antara 1-3 detik
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