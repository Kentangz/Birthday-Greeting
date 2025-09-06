import React from 'react';
import { useLoader} from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const Ring = ({ size, ringTexturePath }) => {
  const ringTexture = useLoader(TextureLoader, ringTexturePath);

  return (
    <mesh rotation-x={Math.PI / 2}>
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