import React from 'react';
import '../App.css';
import Scene from '../components/Scene';

import ShootingStarOverlay from '../components/ShootingStarOverlay'; 

function OpeningPage() {
  return (
    <div className="main-container"> 
      <Scene />
      <ShootingStarOverlay /> 
      <h1 className="main-text z-10">Happy Birthday!</h1>
    </div>
  );
}

export default OpeningPage;