import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ShootingStar from './ShootingStar';
import SolarSystem from './SolarSystem';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 15, 25], fov: 75 }}>
      <color attach="background" args={['black']} />
      <ambientLight intensity={0.1} />
      <Stars saturation={false} count={500} speed={0.5} />
      
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