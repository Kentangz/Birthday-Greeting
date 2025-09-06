import React, { useRef, useEffect } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, MathUtils } from 'three';
import Ring from './Ring';

const Planet = ({ texturePath, size, hasRing = false, ringTexturePath, axialTilt = 0, rotationSpeed = 0.1 }) => {
  const texture = useLoader(TextureLoader, texturePath);
  const planetRef = useRef();

  useEffect(() => {
    if (planetRef.current) {
      planetRef.current.rotation.z = MathUtils.degToRad(axialTilt);
    }
  }, [axialTilt]);

  useFrame(() => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed * 0.01;
    }
  });

  return (
    <group>
      <group ref={planetRef}>
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial map={texture} />
        </mesh>
      </group>
      {hasRing && ringTexturePath && (
        <Ring size={size} ringTexturePath={ringTexturePath} />
      )}
    </group>
  );
};

export default Planet;