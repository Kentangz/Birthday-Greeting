
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Planet from './Planet';

const SolarSystem = () => {
  const planets = [
    { name: 'mercury', color: '#a9a9a9', size: 0.4, orbitalRadius: 3, orbitalSpeed: 0.8 },
    { name: 'venus', color: '#e6e6e6', size: 0.6, orbitalRadius: 5, orbitalSpeed: 0.6 },
    { name: 'earth', color: '#54a0ff', size: 0.7, orbitalRadius: 7, orbitalSpeed: 0.5 },
    { name: 'mars', color: '#ff6b6b', size: 0.5, orbitalRadius: 9, orbitalSpeed: 0.4 },
    { name: 'saturn', color: '#f1c40f', size: 1.2, orbitalRadius: 12, orbitalSpeed: 0.2, hasRing: true },
  ];

  const planetRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    planetRefs.current.forEach((ref, i) => {
      if (ref) {
        const { orbitalRadius, orbitalSpeed } = planets[i];
        ref.position.x = Math.sin(t * orbitalSpeed) * orbitalRadius;
        ref.position.z = Math.cos(t * orbitalSpeed) * orbitalRadius;
        ref.rotation.y += 0.1 * orbitalSpeed; // Self-rotation
      }
    });
  });

  return (
    <>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FFD700" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={100} distance={100} />

      {/* Planets */}
      {planets.map((planet, i) => (
        <group key={planet.name} ref={(el) => (planetRefs.current[i] = el)}>
            <Planet {...planet} />
        </group>
      ))}
    </>
  );
};

export default SolarSystem;
