import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'

// Single electron orbit dengan rotasi
function ElectronOrbit({ speed, size, trailLength, color, offset, rotations, radius }) {
  const ref = useRef()
  
  useFrame((state) => {
    const t = (state.clock.getElapsedTime() + offset) * speed
    
    // Orbit elips dasar
    let x = radius.x * Math.cos(t)
    let y = radius.y * Math.sin(t)
    let z = 0
    
    // Apply rotations
    rotations.forEach(([axis, angle]) => {
      if (axis === 'x') {
        [y, z] = [y * Math.cos(angle) - z * Math.sin(angle), y * Math.sin(angle) + z * Math.cos(angle)]
      } else if (axis === 'y') {
        [x, z] = [x * Math.cos(angle) + z * Math.sin(angle), -x * Math.sin(angle) + z * Math.cos(angle)]
      } else if (axis === 'z') {
        [x, y] = [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)]
      }
    }
    )
    
    ref.current.position.set(x, y, z)
  })
  
  return (
    <Trail width={3} length={trailLength} color={new THREE.Color(...color)} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[size]} />
        <meshBasicMaterial color={color.map(c => c * 2)} toneMapped={false} />
      </mesh>
    </Trail>
  )
}

// Atom dengan orbit configuration
function AtomicShootingStar({ 
  speed = 25, 
  size = 0.2, 
  trailLength = 15, 
}) {
  // Helper function untuk convert derajat ke radian
  const toRad = (deg) => (deg * Math.PI) / 180
  
  // Konfigurasi orbit dengan nilai derajat yang kamu inginkan
  const orbits = [
    { rotations: [['x', toRad(0)], ['y', toRad(45)], ['z', toRad(135)]], offset: 0 },
    { rotations: [['x', toRad(180)], ['y', toRad(225)], ['z', toRad(315)]], offset: Math.PI },
    { rotations: [['x', toRad(90)], ['y', toRad(135)], ['z', toRad(225)]], offset: Math.PI  } // Orbit ketiga untuk melengkapi
  ]
  
  const commonProps = {
    speed: speed,
    size: size,
    trailLength: trailLength,
    color: [1, 5, 10],
    radius: { x: 6, y: 6 } // Lingkaran penuh
  }
  
  return (
    <group>
      {/* Generate orbits */}
      {orbits.map((orbit, i) => (
        <ElectronOrbit
          key={i}
          {...commonProps}
          speed={speed * (1 + i * 0.05)} // Sedikit variasi kecepatan
          offset={orbit.offset}
          rotations={orbit.rotations}
        />
      ))}
    </group>
  )
}

export default AtomicShootingStar