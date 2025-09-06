import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, CameraControls } from '@react-three/drei'; 
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ShootingStar from './ShootingStar';
import SolarSystem from './SolarSystem';
import SpaceBackground from './SpaceBackground';

function Scene() {
  const cameraControlsRef = useRef();
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const solarSystemRef = useRef();

  const handlePointerMissed = () => {
    if (solarSystemRef.current) {
      solarSystemRef.current.deselectPlanet();
    }
  };

  return (
    <Canvas
      camera={{ position: [0, 40, 80], fov: 45 }}
      onPointerMissed={handlePointerMissed}
    >
      {/* <color attach="background" args={['black']} /> */}
      <Stars saturation={false} count={100} speed={3} />

      <SpaceBackground />
      
      {/* <ambientLight intensity={0.1} /> */}
      
      <ShootingStar />
      
      <SolarSystem
        ref={solarSystemRef}
        cameraControlsRef={cameraControlsRef}
        setControlsEnabled={setControlsEnabled}
      />

      <CameraControls
        ref={cameraControlsRef}
        enabled={controlsEnabled}
      />

      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
}

export default Scene;