import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei'; 
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ShootingStar from './ShootingStar';
import SolarSystem from './SolarSystem';
import SpaceBackground from './SpaceBackground';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 15, 25], fov: 75 }}>
      {/* <color attach="background" args={['black']} /> */}
      <Stars saturation={false} count={100} speed={3} />

      <SpaceBackground />
      
      <ambientLight intensity={0.1} />
      
      <ShootingStar />
      
      <SolarSystem />

      <OrbitControls />
      
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} radius={0.7} />
      </EffectComposer>
    </Canvas>
  );
}

export default Scene;