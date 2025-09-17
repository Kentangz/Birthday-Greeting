import React, { useRef, useState, useEffect } from 'react';
import '../App.css';
import Scene from '../components/Scene';

import ShootingStarOverlay from '../components/ShootingStarOverlay'; 

function OpeningPage() {
  const solarSystemRef = useRef();
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.08);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [focusInfo, setFocusInfo] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = Math.max(0, Math.min(1, volume));
    if (!muted && audio.paused) {
      audio.play().catch(() => {/* autoplay may be blocked */});
    }
  }, [muted, volume]);

  const handleNext = () => {
    if (solarSystemRef.current?.focusNext) {
      solarSystemRef.current.focusNext();
    }
  };

  const handlePrev = () => {
    if (solarSystemRef.current?.focusPrev) {
      solarSystemRef.current.focusPrev();
    }
  };

  return (
    <div className="main-container"> 
      <Scene 
        orbitSpeedMultiplier={orbitSpeed}
        audioVolume={volume}
        muted={muted}
        onFocusChange={setFocusInfo}
        solarSystemExternalRef={solarSystemRef}
      />
      <ShootingStarOverlay /> 
      <h1 className="main-text z-10">Happy Birthday!</h1>

      {/* Background ambient music */}
      <audio ref={audioRef} src="/textures/ambient.mp3" loop autoPlay style={{ display: 'none' }} />

      {/* Controls Overlay */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.5)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.15)',
        zIndex: 20
      }}>
        <button onClick={handlePrev} style={{ padding: '6px 10px', cursor: 'pointer' }}>Prev</button>
        <button onClick={handleNext} style={{ padding: '6px 10px', cursor: 'pointer' }}>Next</button>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Orbit speed</span>
          <input type="range" min="0.5" max="2" step="0.1" value={orbitSpeed} onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))} />
        </label>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }} />

        <button onClick={() => setMuted(m => !m)} style={{ padding: '6px 10px', cursor: 'pointer' }}>{muted ? 'Unmute' : 'Mute'}</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>Volume</span>
          <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} />
        </label>
      </div>

      {/* Focus Info Panel */}
      {focusInfo && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(0,0,0,0.5)',
          padding: '12px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 20,
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{focusInfo.displayName}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Size (rel.): {focusInfo.size}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Orbit radius: {focusInfo.orbitalRadius ?? 0}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>Axial tilt: {focusInfo.axialTilt ?? 0}°</div>
        </div>
      )}
    </div>
  );
}

export default OpeningPage;