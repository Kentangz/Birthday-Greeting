import React from 'react';

// This component is now a simple presentational component.
// All animation logic will be handled by its parent (SolarSystem).
const Planet = ({ size, color, emissiveColor, hasRing = false }) => {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={emissiveColor || color}
          emissiveIntensity={0.2} 
          toneMapped={false}
        />
      </mesh>
      {hasRing && (
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[size * 1.5, 0.1, 16, 100]} />
          <meshStandardMaterial color="#aaa" emissive="#aaa" emissiveIntensity={0.1} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
};

export default Planet;