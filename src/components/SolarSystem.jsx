import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MathUtils, Vector3 } from 'three';
import { SUN as SUN_CFG, PLANETS as PLANETS_CFG } from '../config/planets.config';
import { getCircularOrbitPosition } from '../utils/orbit';
import { emitFocusStatus } from '../utils/a11y';
import { useAutoTour } from '../hooks/useAutoTour';
import { useFocusCamera } from '../hooks/useFocusCamera';
import OrbitGizmos from './OrbitGizmos';
import Sun from './Sun';
import PlanetGroup from './PlanetGroup';

const CAMERA_OFFSET_MULTIPLIER = 7;
const SUN_ROTATION_SPEED = 0.0005;
const ANIMATION_DURATION = 2.5;
const SUN_AXIAL_TILT = 7.25;

const AMBIENT_LIGHT_INTENSITY = 0.1;

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

const SolarSystem = ({ cameraControlsRef, setControlsEnabled, orbitSpeedMultiplier = 1, audioVolume = 0.08, muted = false, onFocusChange, autoTourEnabled = false }) => {
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
  const sunRef = useRef();
  
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

  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.rotation.z = MathUtils.degToRad(SUN_AXIAL_TILT);
    }
  }, []);

  useAutoTour({
    enabled: autoTourEnabled,
    isAnimating,
    selectedIndex: selectedBodyIndex,
    itemsLength: planets.length,
    onStep: (idx) => handleCelestialBodyClick(idx),
    intervalMs: 4000,
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

  const isDev = import.meta.env?.MODE !== 'production';

  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} color={0x404040} />
      <directionalLight position={[30, 50, 30]} intensity={0.8} castShadow />

      <group ref={sunRef}>
        <Sun
          size={sun.size}
          texturePath={sun.texturePath}
          axialTilt={sun.axialTilt}
          onClick={() => handleCelestialBodyClick(-1)}
          onDoubleClick={() => handleCelestialBodyClick(-1)}
          onHover={() => { document.body.style.cursor = 'pointer'; }}
          onUnhover={() => { document.body.style.cursor = 'auto'; }}
        />
      </group>

      {isDev && <OrbitGizmos planets={planets} />}

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
};

export default SolarSystem;