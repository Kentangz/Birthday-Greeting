
import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

const Star = () => {
  const ref = useRef();
  const { camera } = useThree(); // Get the camera
  const [visible, setVisible] = useState(false);
  const [startVec, setStartVec] = useState(new THREE.Vector3());
  const [endVec, setEndVec] = useState(new THREE.Vector3());

  const reset = () => {
    // Pick a random screen-space coordinate for start (top-right quadrant)
    const start = new THREE.Vector3(
      THREE.MathUtils.randFloat(0.5, 1), // x in [0.5, 1]
      THREE.MathUtils.randFloat(0.5, 1), // y in [0.5, 1]
      -1 // z should be -1 to be in front of camera
    );

    // Pick a random screen-space coordinate for end (bottom-left quadrant)
    const end = new THREE.Vector3(
      THREE.MathUtils.randFloat(-1, -0.5),
      THREE.MathUtils.randFloat(-1, -0.5),
      -1
    );

    // Unproject these screen-space coordinates into world space
    start.unproject(camera);
    end.unproject(camera);

    setStartVec(start);
    setEndVec(end);

    if (ref.current) {
      ref.current.position.copy(start);
    }
    setVisible(true);
  };

  useEffect(() => {
    const timer = setTimeout(reset, THREE.MathUtils.randInt(2000, 7000));
    return () => clearTimeout(timer);
  }, [visible]);

  useFrame((state, delta) => {
    if (ref.current && visible) {
      // Move from start to end vector
      ref.current.position.lerp(endVec, delta * 0.5); // Use lerp for smooth movement

      // If close enough to the end, hide it
      if (ref.current.position.distanceTo(endVec) < 1) {
        setVisible(false);
      }
    }
  });

  if (!visible) return null;

  return (
    <Trail width={1.5} length={8} color={new THREE.Color(2, 1, 10)} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.25]} />
        <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
      </mesh>
    </Trail>
  );
};

const ShootingStar = () => {
  return (
    <>
      <Star />
      <Star />
    </>
  );
};

export default ShootingStar;
