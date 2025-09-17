import React, { useRef, useEffect, useState } from 'react';
import { useLoader, useFrame } from '@react-three/fiber';
import { TextureLoader, MathUtils } from 'three';
import { Html } from '@react-three/drei';
import Ring from './Ring';

const Planet = ({ name, texturePath, size, hasRing = false, ringTexturePath, axialTilt = 0, rotationSpeed = 0.1, onPlanetClick, onPlanetDoubleClick, showLabel = false }) => {
  const texture = useLoader(TextureLoader, texturePath);
  const planetRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(0); // 0..1 for fade/scale

  useEffect(() => {
    if (planetRef.current) {
      planetRef.current.rotation.z = MathUtils.degToRad(axialTilt);
    }
  }, [axialTilt]);

  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += rotationSpeed * 0.01;
    }
    // Animate tooltip visibility (lerp)
    const target = hovered || showLabel ? 1 : 0;
    const speed = 6; // responsiveness
    setTooltipVisible((v) => {
      const nv = v + (target - v) * Math.min(1, speed * delta);
      return Math.abs(nv - v) < 0.001 ? target : nv;
    });
  });

  // Placeholder for future occlusion check
  const isOccluded = false;

  return (
    <group>
      <group ref={planetRef}>
        <mesh 
          onClick={onPlanetClick}
          onDoubleClick={onPlanetDoubleClick}
          onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial map={texture} />
          {tooltipVisible > 0 && !isOccluded && (
            <Html center distanceFactor={8} position={[0, size * 1.8, 0]} style={{ pointerEvents: 'none' }}>
              <div style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                border: '1px solid rgba(255,255,255,0.2)',
                transform: `scale(${0.9 + 0.1 * tooltipVisible})`,
                opacity: tooltipVisible,
                transition: 'transform 80ms linear, opacity 80ms linear'
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