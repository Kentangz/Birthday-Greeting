import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, MathUtils, Vector3 } from 'three';
import Planet from './Planet';

// Cinematic tuning
const CAMERA_OFFSET_MULTIPLIER = 7; 
const SUN_ROTATION_SPEED = 0.0005;
const ANIMATION_DURATION = 2.5;
const SUN_AXIAL_TILT = 7.25;

const SUN_LIGHT_INTENSITY = 100;
const SUN_LIGHT_DISTANCE = 10;
const SUN_EMISSIVE_INTENSITY = 2;
const AMBIENT_LIGHT_INTENSITY = 0.1;

// Simple WebAudio focus sound
let sharedAudioContext = null;
function playFocusSound() {
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = sharedAudioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Subtle whoosh: upward glide and quick fade
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.25);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    // ignore audio errors (e.g., autoplay restrictions)
  }
}

const SolarSystem = forwardRef(({ cameraControlsRef, setControlsEnabled }, ref) => {
  const { camera } = useThree();

  const sun = useMemo(() => ({
    name: 'sun',
    texturePath: '/textures/sun.jpg',
    size: 6,
    axialTilt: SUN_AXIAL_TILT,
    isSun: true,
    rotationSpeed: SUN_ROTATION_SPEED
  }), []);

  const sunTexture = useLoader(TextureLoader, sun.texturePath);

  // Cinematic orbit radii/speeds (slightly larger spacing, more contrast in speeds)
  const planets = useMemo(() => [
    { name: 'mercury', texturePath: '/textures/mercury.jpg', size: 0.38, orbitalRadius: 12, orbitalSpeed: 1.8, axialTilt: 0.03 },
    { name: 'venus', texturePath: '/textures/venus.jpg', size: 0.95, orbitalRadius: 16, orbitalSpeed: 1.25, axialTilt: 177.4 },
    { name: 'earth', texturePath: '/textures/earth.jpg', size: 1.0, orbitalRadius: 21, orbitalSpeed: 1.0, axialTilt: 23.44 },
    { name: 'mars', texturePath: '/textures/mars.jpg', size: 0.53, orbitalRadius: 28, orbitalSpeed: 0.78, axialTilt: 25.19 },
    { name: 'jupiter', texturePath: '/textures/jupiter.jpg', size: 2.5, orbitalRadius: 44, orbitalSpeed: 0.42, axialTilt: 3.13 },
    { name: 'saturn', texturePath: '/textures/saturn.jpg', size: 2.2, orbitalRadius: 60, orbitalSpeed: 0.3, hasRing: true, ringTexturePath: '/textures/saturn_ring.png', axialTilt: 26.73 },
    { name: 'uranus', texturePath: '/textures/uranus.jpg', size: 1.5, orbitalRadius: 74, orbitalSpeed: 0.2, axialTilt: 97.77 },
    { name: 'neptune', texturePath: '/textures/neptune.jpg', size: 1.45, orbitalRadius: 86, orbitalSpeed: 0.16, axialTilt: 28.32 },
  ], []);

  const planetRefs = useRef([]);
  const sunRef = useRef();
  
  const [selectedBodyIndex, setSelectedBodyIndex] = useState(null);
  
  const [animationState, setAnimationState] = useState({
    isAnimating: false,
    startTime: 0,
    startCameraPos: new Vector3(),
    startCameraTarget: new Vector3(),
  });

  const tempVec1 = useRef(new Vector3());
  const tempVec2 = useRef(new Vector3());
  const tempVec3 = useRef(new Vector3());

  const currentPlanetPositions = useRef(planets.map(() => new Vector3()));

  const getCelestialBodyPosition = (bodyIndex, time, targetVector = null) => {
    if (bodyIndex === -1) {
      if (targetVector) {
        targetVector.set(0, 0, 0);
        return targetVector;
      }
      return new Vector3(0, 0, 0);
    }
    
    const planet = planets[bodyIndex];
    const { orbitalRadius, orbitalSpeed } = planet;
    
    const x = Math.sin(time * orbitalSpeed) * orbitalRadius;
    const z = Math.cos(time * orbitalSpeed) * orbitalRadius;
    
    if (targetVector) {
      targetVector.set(x, 0, z);
      return targetVector;
    }
    
    return new Vector3(x, 0, z);
  };

  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const getCurrentCameraTarget = () => {
    const direction = tempVec1.current;
    camera.getWorldDirection(direction);
    direction.multiplyScalar(camera.position.length());
    return camera.position.clone().add(direction);
  };

  const deselectAndReset = () => {
    setAnimationState(prev => ({ ...prev, isAnimating: false }));
    setSelectedBodyIndex(null);
    setControlsEnabled(false);
    
    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset(true).then(() => {
        setControlsEnabled(true);
      });
    }
    console.log('Focus released');
  };

  useImperativeHandle(ref, () => ({
    deselectPlanet() {
      if (animationState.isAnimating) {
        console.log('Animation in progress - onPointerMissed blocked');
        return;
      }
      deselectAndReset();
    }
  }));
  
  const handleCelestialBodyClick = (bodyIndex) => {
    if (animationState.isAnimating) {
      console.log('Animation in progress - celestial body click blocked');
      return;
    }
    
    if (selectedBodyIndex === bodyIndex) {
      deselectAndReset();
      return;
    }

    const bodyName = bodyIndex === -1 ? 'sun' : planets[bodyIndex].name;
    console.log(`Focusing on: ${bodyName}`);

    // play focus sound on selection
    playFocusSound();
    
    const currentTime = performance.now() / 1000;
    
    setAnimationState({
      isAnimating: true,
      startTime: currentTime,
      startCameraPos: camera.position.clone(),
      startCameraTarget: getCurrentCameraTarget(),
    });
    
    setSelectedBodyIndex(bodyIndex);
    setControlsEnabled(false);
  };
  
  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.rotation.z = MathUtils.degToRad(SUN_AXIAL_TILT);
    }
  }, []);

  useFrame(({ clock }) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += SUN_ROTATION_SPEED; 
    }

    const currentTime = clock.getElapsedTime();
    
    planetRefs.current.forEach((ref, i) => {
      if (ref) {
        getCelestialBodyPosition(i, currentTime, currentPlanetPositions.current[i]);
        ref.position.copy(currentPlanetPositions.current[i]);
      }
    });

    if (animationState.isAnimating && selectedBodyIndex !== null) {
      const elapsed = currentTime - animationState.startTime;
      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(progress);
      
      let currentBodyPos;
      let bodySize;
      
      if (selectedBodyIndex === -1) {
        currentBodyPos = new Vector3(0, 0, 0);
        bodySize = sun.size;
      } else {
        currentBodyPos = currentPlanetPositions.current[selectedBodyIndex];
        bodySize = planets[selectedBodyIndex].size;
      }
      
      const offsetDistance = bodySize * CAMERA_OFFSET_MULTIPLIER;
      const targetCameraPos = tempVec2.current.set(
        currentBodyPos.x,
        currentBodyPos.y,
        currentBodyPos.z + offsetDistance
      );
      
      const newCameraPos = tempVec1.current.lerpVectors(
        animationState.startCameraPos,
        targetCameraPos,
        easedProgress
      );
      
      const currentTarget = tempVec3.current.lerpVectors(
        animationState.startCameraTarget,
        currentBodyPos,
        easedProgress
      );
      
      camera.position.copy(newCameraPos);
      camera.lookAt(currentTarget);
      
      if (progress >= 1) {
        setAnimationState(prev => ({ ...prev, isAnimating: false }));
        console.log('Animation complete - Perfect sync!');
      }
    }
    
    else if (selectedBodyIndex !== null && !animationState.isAnimating) {
      let currentBodyPos;
      let bodySize;
      
      if (selectedBodyIndex === -1) {
        currentBodyPos = new Vector3(0, 0, 0);
        bodySize = sun.size;
      } else {
        currentBodyPos = currentPlanetPositions.current[selectedBodyIndex];
        bodySize = planets[selectedBodyIndex].size;
      }
      
      const offsetDistance = bodySize * CAMERA_OFFSET_MULTIPLIER;
      
      const cameraPosition = tempVec1.current.set(
        currentBodyPos.x,
        currentBodyPos.y,
        currentBodyPos.z + offsetDistance
      );

      camera.position.copy(cameraPosition);
      camera.lookAt(currentBodyPos);
    }
  });

  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} color={0x404040} />
      
      <group
        ref={sunRef}
        onClick={(e) => {
          e.stopPropagation();
          handleCelestialBodyClick(-1);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
      >
        <mesh>
          <sphereGeometry args={[sun.size, 32, 32]} />
          <meshStandardMaterial
            map={sunTexture}
            emissiveMap={sunTexture}
            emissive={0xffc100}  
            emissiveIntensity={SUN_EMISSIVE_INTENSITY}
            roughness={1.0}
            metalness={0.0}
          />
        </mesh>
        
        <pointLight 
          intensity={SUN_LIGHT_INTENSITY} 
          distance={SUN_LIGHT_DISTANCE}
          color={0xffffff}
          decay={2}
        />
        
        <pointLight 
          intensity={50} 
          distance={300}
          color={0xffe9c1}
          decay={1}
        />
      </group>

      {planets.map((planet, i) => (
        <group
          key={planet.name}
          ref={(el) => (planetRefs.current[i] = el)}
        >
          <Planet 
            {...planet} 
            rotationSpeed={planet.orbitalSpeed} 
            onPlanetClick={() => handleCelestialBodyClick(i)}
          />
        </group>
      ))}
    </>
  );
});

export default SolarSystem;