// src/pages/OpeningPage.jsx

import React from 'react';
import '../App.css';
import Scene from '../components/Scene';
// Kita akan buat komponen baru ini
import ShootingStarOverlay from '../components/ShootingStarOverlay'; 

function OpeningPage() {
  return (
    // 1. Buat div pembungkus utama
    <div className="main-container"> 
      <Scene />
      <ShootingStarOverlay /> {/* 2. Tambahkan komponen overlay di sini */}
      <h1 className="main-text z-10">Happy Birthday!</h1>
    </div>
  );
}

export default OpeningPage;