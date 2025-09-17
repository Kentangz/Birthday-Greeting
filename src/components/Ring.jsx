import { useLoader, useFrame} from '@react-three/fiber';
import React,{useRef} from 'react';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const Ring = ({ size, ringTexturePath }) => {
  const ringTexture = useLoader(TextureLoader, ringTexturePath);
  const ringRef = useRef();

  useFrame(() => { 
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.002; 
    }
  });

  return (
    <mesh ref={ringRef} rotation-x={Math.PI / 2}>
      <ringGeometry args={[size * 1.2, size * 2.2, 64]} /> 
      <meshStandardMaterial 
        map={ringTexture} 
        side={THREE.DoubleSide}
        transparent={true}
        opacity={0.8}
      />
    </mesh>
  );
};

export default Ring;