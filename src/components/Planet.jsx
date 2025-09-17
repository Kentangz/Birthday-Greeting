import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, MathUtils } from 'three';
import { Html } from '@react-three/drei';
import Ring from './Ring';

const Planet = ({ name, texturePath, size, hasRing = false, ringTexturePath, axialTilt = 0, rotationSpeed = 0.1, onPlanetClick }) => {
  const texture = useLoader(TextureLoader, texturePath);
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);

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
        <mesh 
          onClick={onPlanetClick}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial map={texture} />
          {hovered && (
            <Html center distanceFactor={8} position={[0, size * 1.8, 0]}>
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {name}
              </div>
            </Html>
          )}
        </mesh>
      </group>
      {hasRing && ringTexturePath && (
        <Ring size={size} ringTexturePath={ringTexturePath} />
      )}
    </group>
  );
};

export default Planet;