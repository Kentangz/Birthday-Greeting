import React, { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader,MathUtils } from 'three';
import Planet from './Planet';

const SolarSystem = () => {
    const planets = [
        { name: 'mercury', texturePath: '/textures/mercury.jpg', size: 0.38, orbitalRadius: 9, orbitalSpeed: 1.6,axialTilt: 0.03 },
        { name: 'venus', texturePath: '/textures/venus.jpg', size: 0.95, orbitalRadius: 12, orbitalSpeed: 1.2, axialTilt: 177.4 },
        { name: 'earth', texturePath: '/textures/earth.jpg', size: 1.0, orbitalRadius: 16, orbitalSpeed: 1.0, axialTilt: 23.44 },
        { name: 'mars', texturePath: '/textures/mars.jpg', size: 0.53, orbitalRadius: 22, orbitalSpeed: 0.8, axialTilt: 25.19 },
        { name: 'jupiter', texturePath: '/textures/jupiter.jpg', size: 2.5, orbitalRadius: 35, orbitalSpeed: 0.45, axialTilt: 3.13 },
        { name: 'saturn', texturePath: '/textures/saturn.jpg', size: 2.2, orbitalRadius: 48, orbitalSpeed: 0.3, hasRing: true, ringTexturePath: '/textures/saturn_ring.png', axialTilt: 26.73 },
        { name: 'uranus', texturePath: '/textures/uranus.jpg', size: 1.5, orbitalRadius: 58, orbitalSpeed: 0.2, axialTilt: 97.77 },
        { name: 'neptune', texturePath: '/textures/neptune.jpg', size: 1.45, orbitalRadius: 66, orbitalSpeed: 0.15, axialTilt: 28.32 },
      ];

  const planetRefs = useRef([]);
  const sunRef = useRef();
  const sunTexture = useLoader(TextureLoader, '/textures/sun.jpg');

    useEffect(() => {
    if (sunRef.current) {
      sunRef.current.rotation.z = MathUtils.degToRad(7.25);
    }
  }, []);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += 0.0005; 
    }
    const t = clock.getElapsedTime();
    planetRefs.current.forEach((ref, i) => {
      if (ref) {
        const { orbitalRadius, orbitalSpeed } = planets[i];
        ref.position.x = Math.sin(t * orbitalSpeed) * orbitalRadius;
        ref.position.z = Math.cos(t * orbitalSpeed) * orbitalRadius;
      }
    });
  });

  return (
    <>
      {/* Sun */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[6, 32, 32]} /> 
        <meshStandardMaterial
          map={sunTexture}
          emissiveMap={sunTexture}
          emissive={0xffff00}
          emissiveIntensity={1.5}
        />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={250} distance={200} />

      {/* Planets */}
      {planets.map((planet, i) => (
        <group key={planet.name} ref={(el) => (planetRefs.current[i] = el)}>
            <Planet {...planet} rotationSpeed={planet.orbitalSpeed} />
        </group>
      ))}
    </>
  );
};

export default SolarSystem;
