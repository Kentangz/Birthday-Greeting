import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, CameraControls } from '@react-three/drei'; 
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
import ShootingStar from './ShootingStar';
import SolarSystem from './SolarSystem';
import SpaceBackground from './SpaceBackground';

function Scene({ orbitSpeedMultiplier = 1, audioVolume = 0.08, muted = false, onFocusChange, solarSystemExternalRef }) {
  const cameraControlsRef = useRef();
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const solarSystemRef = useRef();

  // ESC to reset focus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && solarSystemRef.current) {
        solarSystemRef.current.deselectPlanet();
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
    >
      <Stars saturation={false} count={120} speed={3} />

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
      />

      <CameraControls
        ref={cameraControlsRef}
        enabled={controlsEnabled}
      />

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} radius={0.7} />
        <DepthOfField focusDistance={0.02} focalLength={0.025} bokehScale={1.5} />
        <Vignette eskil={false} offset={0.2} darkness={0.4} />
      </EffectComposer>
    </Canvas>
  );
}

export default Scene;