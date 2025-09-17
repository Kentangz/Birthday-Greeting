import { Stars, CameraControls } from '@react-three/drei'; 
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, DepthOfField, Vignette, GodRays, Noise } from '@react-three/postprocessing';
import React, { useRef, useState, useEffect } from 'react';

import ShootingStar from './ShootingStar';
import SolarSystem from './SolarSystem';
import SpaceBackground from './SpaceBackground';
import { GODRAYS_WEIGHT, GODRAYS_EXPOSURE } from '../config/constants';

function Scene({ orbitSpeedMultiplier = 1, audioVolume = 0.08, muted = false, onFocusChange, solarSystemExternalRef, autoTourEnabled = false, photoMode = false }) {
  const cameraControlsRef = useRef();
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const solarSystemRef = useRef();
  const sunMeshRef = useRef(null);

  const handleSunMeshReady = (mesh) => {
    sunMeshRef.current = mesh;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!solarSystemRef.current) return;
      if (e.key === 'Escape') {
        solarSystemRef.current.deselectPlanet();
      } else if (e.key === 'ArrowRight') {
        solarSystemRef.current.focusNext();
      } else if (e.key === 'ArrowLeft') {
        solarSystemRef.current.focusPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handlePointerMissed = () => {
    if (solarSystemRef.current) {
      solarSystemRef.current.deselectPlanet();
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 40, 80], fov: 45 }}
      onPointerMissed={handlePointerMissed}
      shadows
      dpr={photoMode ? [1, 2] : [1, 1.5]}
    >
      {/* Parallax star layers */}
      <Stars saturation={false} count={80} speed={0.5} radius={120} depth={50} factor={2} />
      <Stars saturation={false} count={120} speed={1.5} radius={160} depth={60} factor={3} />
      <Stars saturation={false} count={160} speed={3} radius={200} depth={80} factor={4} />

      <SpaceBackground />
      
      <ShootingStar />
      
      <SolarSystem
        ref={(node) => {
          solarSystemRef.current = node || null;
          if (solarSystemExternalRef) {
            solarSystemExternalRef.current = node || null;
          }
        }}
        cameraControlsRef={cameraControlsRef}
        setControlsEnabled={setControlsEnabled}
        orbitSpeedMultiplier={orbitSpeedMultiplier}
        audioVolume={audioVolume}
        muted={muted}
        onFocusChange={onFocusChange}
        autoTourEnabled={autoTourEnabled}
        onSunMeshReady={handleSunMeshReady}
      />

      <CameraControls
        ref={cameraControlsRef}
        enabled={controlsEnabled}
        minDistance={10}
        maxDistance={140}
      />

      <EffectComposer>
        {sunMeshRef.current && (
          <GodRays 
            sun={sunMeshRef.current}
            samples={32}
            density={0.6}
            decay={0.93}
            weight={GODRAYS_WEIGHT}
            exposure={GODRAYS_EXPOSURE}
            clampMax={1}
            kernelSize={3}
            blur={true}
          />
        )}
        <Bloom mipmapBlur luminanceThreshold={1.15} radius={0.6} />
        <DepthOfField focusDistance={0.02} focalLength={0.025} bokehScale={1.5} />
        <Vignette eskil={false} offset={0.2} darkness={0.22} />
        <Noise premultiply opacity={0.035} />
      </EffectComposer>
    </Canvas>
  );
}

export default Scene;