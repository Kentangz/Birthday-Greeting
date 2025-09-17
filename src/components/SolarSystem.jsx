import { useFrame, useThree } from '@react-three/fiber';
import React, { useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Vector3 } from 'three';

import OrbitGizmos from './OrbitGizmos';
import PlanetGroup from './PlanetGroup';
import Sun from './Sun';
import { CAMERA_OFFSET_MULTIPLIER, ANIMATION_DURATION, AMBIENT_LIGHT_INTENSITY, SHOW_GIZMOS } from '../config/constants';
import { SUN as SUN_CFG, PLANETS as PLANETS_CFG } from '../config/planets.config';
import { useAutoTour } from '../hooks/useAutoTour';
import { useFocusCamera } from '../hooks/useFocusCamera';
import { emitFocusStatus } from '../utils/a11y';
import { getCircularOrbitPosition } from '../utils/orbit';

const SUN_AXIAL_TILT = 7.25;

let sharedAudioContext = null;
function playFocusSound(volume = 0.08, muted = false) {
  if (muted || volume <= 0) return;
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  const ctx = sharedAudioContext;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(680, now + 0.25);
  const peak = Math.max(0.0001, Math.min(1, volume));
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.4);
}

const SolarSystem = forwardRef(({ cameraControlsRef, setControlsEnabled, orbitSpeedMultiplier = 1, audioVolume = 0.08, muted = false, onFocusChange, autoTourEnabled = false, onSunMeshReady }, ref) => {
  const { camera } = useThree();

  const sun = useMemo(() => ({
    name: SUN_CFG.name,
    displayName: SUN_CFG.displayName,
    displayNameId: SUN_CFG.displayNameId,
    texturePath: SUN_CFG.texturePath,
    size: SUN_CFG.size,
    axialTilt: SUN_AXIAL_TILT,
  }), []);

  const planets = useMemo(() => PLANETS_CFG, []);

  const planetRefs = useRef([]);
  
  const [selectedBodyIndex, setSelectedBodyIndex] = useState(null);

  const { isAnimating, beginAnimation, animateTo, chase } = useFocusCamera({ camera, animationDuration: ANIMATION_DURATION, offsetMultiplier: CAMERA_OFFSET_MULTIPLIER });

  const currentPlanetPositions = useRef(planets.map(() => new Vector3()));

  const getCelestialBodyPosition = (bodyIndex, time, targetVector = null) => {
    if (bodyIndex === -1) {
      if (targetVector) { targetVector.set(0, 0, 0); return targetVector; }
      return new Vector3(0, 0, 0);
    }
    const p = planets[bodyIndex];
    return getCircularOrbitPosition(time, p.orbitalRadius, p.orbitalSpeed * orbitSpeedMultiplier, targetVector || undefined);
  };

  const deselectAndReset = useCallback(() => {
    setSelectedBodyIndex(null);
    setControlsEnabled(false);
    onFocusChange?.(null);
    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset(true).then(() => {
        setControlsEnabled(true);
      });
    }
  }, [cameraControlsRef, onFocusChange, setControlsEnabled]);

  const handleCelestialBodyClick = useCallback((bodyIndex) => {
    if (isAnimating) return;
    if (selectedBodyIndex === bodyIndex) { deselectAndReset(); return; }

    playFocusSound(audioVolume, muted);
    beginAnimation();

    setSelectedBodyIndex(bodyIndex);
    setControlsEnabled(false);

    if (bodyIndex === -1) {
      onFocusChange?.({ displayName: sun.displayName, displayNameId: sun.displayNameId, size: sun.size, orbitalRadius: 0, axialTilt: sun.axialTilt });
      emitFocusStatus(sun.displayName, sun.displayNameId);
    } else {
      const p = planets[bodyIndex];
      onFocusChange?.({ displayName: p.displayName, displayNameId: p.displayNameId, size: p.size, orbitalRadius: p.orbitalRadius, axialTilt: p.axialTilt });
      emitFocusStatus(p.displayName, p.displayNameId);
    }
  }, [isAnimating, selectedBodyIndex, deselectAndReset, audioVolume, muted, beginAnimation, setControlsEnabled, onFocusChange, planets, sun.displayName, sun.displayNameId, sun.size, sun.axialTilt]);

  // Sun axial tilt is handled inside Sun component

  // Expose imperative controls for keyboard/UI navigation
  useImperativeHandle(ref, () => ({
    deselectPlanet: () => {
      deselectAndReset();
    },
    focusNext: () => {
      if (isAnimating) return;
      // Cycle: Sun (-1) -> 0 -> 1 -> ... -> last -> Sun
      let nextIndex;
      if (selectedBodyIndex === null) {
        nextIndex = 0;
      } else if (selectedBodyIndex === -1) {
        nextIndex = 0;
      } else if (selectedBodyIndex >= planets.length - 1) {
        nextIndex = -1; // back to Sun
      } else {
        nextIndex = selectedBodyIndex + 1;
      }
      handleCelestialBodyClick(nextIndex);
    },
    focusPrev: () => {
      if (isAnimating) return;
      // Reverse cycle: Sun (-1) <- 0 <- 1 <- ...
      let prevIndex;
      if (selectedBodyIndex === null) {
        prevIndex = planets.length - 1;
      } else if (selectedBodyIndex === -1) {
        prevIndex = planets.length - 1;
      } else if (selectedBodyIndex === 0) {
        prevIndex = -1; // to Sun
      } else {
        prevIndex = selectedBodyIndex - 1;
      }
      handleCelestialBodyClick(prevIndex);
    },
  }), [deselectAndReset, handleCelestialBodyClick, isAnimating, planets.length, selectedBodyIndex]);

  // Make dwell time short for responsiveness (slightly larger than animation)
  useAutoTour({
    enabled: autoTourEnabled,
    isAnimating,
    selectedIndex: selectedBodyIndex,
    itemsLength: planets.length,
    onStep: (idx) => handleCelestialBodyClick(idx),
    intervalMs: Math.max(1800, ANIMATION_DURATION * 1000 + 200),
  });

  useFrame(({ clock }) => {
    const currentTime = clock.getElapsedTime();

    planetRefs.current.forEach((ref, i) => {
      if (ref) {
        getCelestialBodyPosition(i, currentTime, currentPlanetPositions.current[i]);
        ref.position.copy(currentPlanetPositions.current[i]);
      }
    });

    if (isAnimating && selectedBodyIndex !== null) {
      let currentBodyPos, bodySize;
      if (selectedBodyIndex === -1) { currentBodyPos = new Vector3(0,0,0); bodySize = sun.size; }
      else { currentBodyPos = currentPlanetPositions.current[selectedBodyIndex]; bodySize = planets[selectedBodyIndex].size; }
      animateTo({ currentBodyPos, bodySize, currentTime });
    } else if (selectedBodyIndex !== null && !isAnimating) {
      let currentBodyPos, bodySize;
      if (selectedBodyIndex === -1) { currentBodyPos = new Vector3(0,0,0); bodySize = sun.size; }
      else { currentBodyPos = currentPlanetPositions.current[selectedBodyIndex]; bodySize = planets[selectedBodyIndex].size; }
      chase({ currentBodyPos, bodySize });
    }
  });

  const showGizmos = Boolean(SHOW_GIZMOS);

  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} color={0x404040} />
      <directionalLight position={[30, 50, 30]} intensity={0.8} castShadow />

      <Sun
        size={sun.size}
        texturePath={sun.texturePath}
        axialTilt={sun.axialTilt}
        onClick={() => handleCelestialBodyClick(-1)}
        onDoubleClick={() => handleCelestialBodyClick(-1)}
        onHover={() => { document.body.style.cursor = 'pointer'; }}
        onUnhover={() => { document.body.style.cursor = 'auto'; }}
        onMeshReady={onSunMeshReady}
      />

      {showGizmos && <OrbitGizmos planets={planets} />}

      {planets.map((planet, i) => (
        <PlanetGroup
          key={planet.name}
          planet={planet}
          groupRef={(el) => (planetRefs.current[i] = el)}
          onHover={(e) => { e.stopPropagation(); }}
          onUnhover={(e) => { e.stopPropagation(); }}
          onClick={() => handleCelestialBodyClick(i)}
          onDoubleClick={() => handleCelestialBodyClick(i)}
        />
      ))}
    </>
  );
});

export default SolarSystem;