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
  const [autoTour, setAutoTour] = useState(false);
  const [photoMode, setPhotoMode] = useState(false);
  const [lang, setLang] = useState('id'); // 'id' | 'en'
  const [ariaStatus, setAriaStatus] = useState('');
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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'p') {
        setPhotoMode(v => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Listen to ARIA-live events from SolarSystem
  useEffect(() => {
    const onStatus = (e) => {
      if (!e.detail) return;
      setAriaStatus(lang === 'id' ? e.detail.id : e.detail.en);
    };
    window.addEventListener('a11y-focus-status', onStatus);
    return () => window.removeEventListener('a11y-focus-status', onStatus);
  }, [lang]);

  const t = (key) => {
    const dict = {
      prev: { id: 'Sebelumnya', en: 'Previous' },
      next: { id: 'Berikutnya', en: 'Next' },
      playTour: { id: 'Mulai tur', en: 'Play tour' },
      pauseTour: { id: 'Jeda tur', en: 'Pause tour' },
      orbitSpeed: { id: 'Kecepatan orbit', en: 'Orbit speed' },
      mute: { id: 'Bisukan', en: 'Mute' },
      unmute: { id: 'Suara', en: 'Unmute' },
      volume: { id: 'Volume', en: 'Volume' },
      photoMode: { id: 'Mode Foto', en: 'Photo mode' },
      exitPhoto: { id: 'Keluar Mode Foto', en: 'Exit Photo' },
      focusing: { id: 'Fokus', en: 'Focusing' },
    };
    return dict[key]?.[lang] || key;
  };

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
        autoTourEnabled={autoTour}
        photoMode={photoMode}
      />
      {!photoMode && <ShootingStarOverlay />}
      {!photoMode && <h1 className="main-text z-10">Happy Birthday!</h1>}

      {/* ARIA live region for focus status */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">{ariaStatus}</div>

      <audio ref={audioRef} src="/textures/ambient.mp3" loop autoPlay style={{ display: 'none' }} />

      {!photoMode && (
        <div className="glass controls" role="toolbar" aria-label="Scene controls">
          {/* Language toggle */}
          <div className="control-group" aria-label="Language">
            <button className="icon-btn tooltip" data-tooltip={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'} onClick={() => setLang(l => (l === 'id' ? 'en' : 'id'))} aria-label="Toggle language">
              <span className="icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0s4 3.5 4 9-4 9-4 9-4-3.5-4-9 4-9 4-9zM3 12h18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
              </span>
            </button>
          </div>

          <div className="divider" />

          <div className="control-group" aria-label="Navigation">
            <button className="icon-btn tooltip" data-tooltip={`${t('prev')} (←)`} onClick={handlePrev} aria-label={t('prev')}>
              <span className="icon" aria-hidden="true">{/* left */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 18l-6-6 6-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
            <button className="icon-btn tooltip" data-tooltip={`${t('next')} (→)`} onClick={handleNext} aria-label={t('next')}>
              <span className="icon" aria-hidden="true">{/* right */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </button>
          </div>

          <div className="divider" />

          <div className="control-group" aria-label="Tour">
            <button className="icon-btn tooltip" data-tooltip={autoTour ? t('pauseTour') : t('playTour')} onClick={() => setAutoTour(v => !v)} aria-pressed={autoTour} aria-label={autoTour ? t('pauseTour') : t('playTour')}>
              <span className="icon" aria-hidden="true">
                {autoTour ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6h-2v12h2V6zm6 0h-2v12h2V6z" fill="#fff"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7L8 5z" fill="#fff"/></svg>
                )}
              </span>
            </button>
          </div>

          <div className="divider" />

          <div className="control-group" aria-label={t('orbitSpeed')}>
            <input className="tooltip" data-tooltip={t('orbitSpeed')} type="range" min="0.5" max="2" step="0.1" value={orbitSpeed} onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))} aria-valuemin={0.5} aria-valuemax={2} aria-valuenow={orbitSpeed} />
          </div>

          <div className="divider" />

          <div className="control-group" aria-label="Audio">
            <button className="icon-btn tooltip" data-tooltip={muted ? t('unmute') : t('mute')} onClick={() => setMuted(m => !m)} aria-pressed={muted} aria-label={muted ? t('unmute') : t('mute')}>
              <span className="icon" aria-hidden="true">
                {muted ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 9v6H5l-4 4V5l4 4h4zm13.414 2l-3-3-2.121 2.121L19.172 12l-1.879 1.879L19.414 16l3-3z" fill="#fff"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM14 3.23v2.06c3.39.49 6 3.39 6 6.71s-2.61 6.22-6 6.71v2.06c4.45-.52 8-4.27 8-8.77s-3.55-8.25-8-8.77z" fill="#fff"/></svg>
                )}
              </span>
            </button>
            <input className="tooltip" data-tooltip={t('volume')} type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} aria-valuemin={0} aria-valuemax={1} aria-valuenow={volume} />
          </div>

          <div className="divider" />

          <div className="control-group" aria-label={t('photoMode')}>
            <button className="btn tooltip" data-tooltip={t('photoMode')} onClick={() => setPhotoMode(v => !v)}></button>
          </div>
        </div>
      )}

      {photoMode && (
        <button
          onClick={() => setPhotoMode(false)}
          className="exit-photo"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 25
          }}
        >
          {t('exitPhoto')} (P)
        </button>
      )}

      {!photoMode && focusInfo && (
        <div className="info-panel" style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          padding: '12px 14px',
          zIndex: 20,
          minWidth: '200px'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{lang === 'id' ? focusInfo.displayNameId || focusInfo.displayName : focusInfo.displayName}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{lang === 'id' ? 'Ukuran (rel.)' : 'Size (rel.)'}: {focusInfo.size}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{lang === 'id' ? 'Jari-jari orbit' : 'Orbit radius'}: {focusInfo.orbitalRadius ?? 0}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{lang === 'id' ? 'Kemiringan sumbu' : 'Axial tilt'}: {focusInfo.axialTilt ?? 0}°</div>
        </div>
      )}
    </div>
  );
}

export default OpeningPage;