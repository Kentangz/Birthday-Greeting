import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader, MathUtils, Vector3 } from 'three';
import Planet from './Planet';

// Cinematic tuning
const CAMERA_OFFSET_MULTIPLIER = 7;
const SUN_ROTATION_SPEED = 0.0005;
const ANIMATION_DURATION = 2.5;
const SUN_AXIAL_TILT = 7.25;

const SUN_LIGHT_INTENSITY = 80; // reduced from 100
const SUN_LIGHT_DISTANCE = 10;
const SUN_EMISSIVE_INTENSITY = 1.2; // reduced from 2
const AMBIENT_LIGHT_INTENSITY = 0.1;

let sharedAudioContext = null;
function playFocusSound(volume = 0.08, muted = false) {
  if (muted || volume <= 0) return;
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = sharedAudioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.25);

    const peak = Math.max(0.0001, Math.min(1, volume));
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  } catch {
    /* no-op */
  }
}

const SolarSystem = forwardRef(({ cameraControlsRef, setControlsEnabled, orbitSpeedMultiplier = 1, audioVolume = 0.08, muted = false, onFocusChange, autoTourEnabled = false, showLabels = false, onSunMeshReady }, ref) => {
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

  const planets = useMemo(() => [
    { name: 'mercury', displayName: 'Mercury', texturePath: '/textures/mercury.jpg', size: 0.38, orbitalRadius: 12, orbitalSpeed: 1.8, axialTilt: 0.03 },
    { name: 'venus', displayName: 'Venus', texturePath: '/textures/venus.jpg', size: 0.95, orbitalRadius: 16, orbitalSpeed: 1.25, axialTilt: 177.4 },
    { name: 'earth', displayName: 'Earth', texturePath: '/textures/earth.jpg', size: 1.0, orbitalRadius: 21, orbitalSpeed: 1.0, axialTilt: 23.44 },
    { name: 'mars', displayName: 'Mars', texturePath: '/textures/mars.jpg', size: 0.53, orbitalRadius: 28, orbitalSpeed: 0.78, axialTilt: 25.19 },
    { name: 'jupiter', displayName: 'Jupiter', texturePath: '/textures/jupiter.jpg', size: 2.5, orbitalRadius: 44, orbitalSpeed: 0.42, axialTilt: 3.13 },
    { name: 'saturn', displayName: 'Saturn', texturePath: '/textures/saturn.jpg', size: 2.2, orbitalRadius: 60, orbitalSpeed: 0.3, hasRing: true, ringTexturePath: '/textures/saturn_ring.png', axialTilt: 26.73 },
    { name: 'uranus', displayName: 'Uranus', texturePath: '/textures/uranus.jpg', size: 1.5, orbitalRadius: 74, orbitalSpeed: 0.2, axialTilt: 97.77 },
    { name: 'neptune', displayName: 'Neptune', texturePath: '/textures/neptune.jpg', size: 1.45, orbitalRadius: 86, orbitalSpeed: 0.16, axialTilt: 28.32 },
  ], []);

  const planetRefs = useRef([]);
  const sunRef = useRef();
  const sunMeshRef = useRef();
  
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
    
    const x = Math.sin(time * (orbitalSpeed * orbitSpeedMultiplier)) * orbitalRadius;
    const z = Math.cos(time * (orbitalSpeed * orbitSpeedMultiplier)) * orbitalRadius;
    
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
    onFocusChange?.(null);
    
    if (cameraControlsRef.current) {
      cameraControlsRef.current.reset(true).then(() => {
        setControlsEnabled(true);
      });
    }
  };

  useImperativeHandle(ref, () => ({
    deselectPlanet() {
      if (animationState.isAnimating) return;
      deselectAndReset();
    },
    focusNext() {
      if (animationState.isAnimating) return;
      const nextIndex = selectedBodyIndex === null ? 0 : (selectedBodyIndex + 1) % planets.length;
      handleCelestialBodyClick(nextIndex);
    },
    focusPrev() {
      if (animationState.isAnimating) return;
      const prevIndex = selectedBodyIndex === null ? planets.length - 1 : (selectedBodyIndex - 1 + planets.length) % planets.length;
      handleCelestialBodyClick(prevIndex);
    }
  }));
  
  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.rotation.z = MathUtils.degToRad(SUN_AXIAL_TILT);
    }
    if (onSunMeshReady && sunMeshRef.current) {
      onSunMeshReady(sunMeshRef.current);
    }
  }, [onSunMeshReady]);

  // Start immediately when enabling auto-tour and nothing is selected
  useEffect(() => {
    if (autoTourEnabled && selectedBodyIndex === null && !animationState.isAnimating) {
      const nextIndex = 0;
      handleCelestialBodyClick(nextIndex);
    }
  }, [autoTourEnabled, selectedBodyIndex, animationState.isAnimating]);

  // Auto-tour: cycle focus every N seconds when enabled
  useEffect(() => {
    if (!autoTourEnabled) return;
    const interval = setInterval(() => {
      if (animationState.isAnimating) return;
      const nextIndex = selectedBodyIndex === null ? 0 : (selectedBodyIndex + 1) % planets.length;
      handleCelestialBodyClick(nextIndex);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoTourEnabled, selectedBodyIndex, animationState.isAnimating, planets.length]);
  
  const handleCelestialBodyClick = (bodyIndex) => {
    if (animationState.isAnimating) return;
    
    if (selectedBodyIndex === bodyIndex) {
      deselectAndReset();
      return;
    }

    playFocusSound(audioVolume, muted);
    
    const currentTime = performance.now() / 1000;
    
    setAnimationState({
      isAnimating: true,
      startTime: currentTime,
      startCameraPos: camera.position.clone(),
      startCameraTarget: getCurrentCameraTarget(),
    });
    
    setSelectedBodyIndex(bodyIndex);
    setControlsEnabled(false);

    if (bodyIndex === -1) {
      onFocusChange?.({ displayName: 'Sun', size: sun.size, orbitalRadius: 0, axialTilt: sun.axialTilt });
    } else {
      const p = planets[bodyIndex];
      onFocusChange?.({ displayName: p.displayName, size: p.size, orbitalRadius: p.orbitalRadius, axialTilt: p.axialTilt });
    }
  };
  
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

      {/* Directional light for shadows */}
      <directionalLight
        position={[30, 50, 30]}
        intensity={0.8}
        castShadow
      />
      
      <group
        ref={sunRef}
        onClick={(e) => { e.stopPropagation(); handleCelestialBodyClick(-1); }}
        onDoubleClick={(e) => { e.stopPropagation(); handleCelestialBodyClick(-1); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
      >
        <mesh ref={sunMeshRef} castShadow receiveShadow>
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
          intensity={40} 
          distance={300}
          color={0xffe9c1}
          decay={1}
        />
      </group>

      {/* Orbit lines */}
      {planets.map((planet) => (
        <mesh key={`${planet.name}-orbit`} rotation-x={-Math.PI / 2} receiveShadow>
          <ringGeometry args={[planet.orbitalRadius - 0.02, planet.orbitalRadius + 0.02, 128]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.15} />
        </mesh>
      ))}

      {planets.map((planet, i) => (
        <group
          key={planet.name}
          ref={(el) => (planetRefs.current[i] = el)}
        >
          <Planet 
            {...planet} 
            rotationSpeed={planet.orbitalSpeed} 
            onPlanetClick={() => handleCelestialBodyClick(i)}
            onPlanetDoubleClick={() => handleCelestialBodyClick(i)}
            showLabel={showLabels}
          />
        </group>
      ))}
    </>
  );
});

export default SolarSystem;