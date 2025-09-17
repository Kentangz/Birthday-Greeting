import * as THREE from 'three'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail, Line } from '@react-three/drei'

// Moving particle that travels along an ellipse in the XY plane
function EllipseRunner({ a = 6, b = 2.8, speed = 1, size = 0.2, trailLength = 20, colorHex = '#61dafb', offset = 0, rotationZ = 0 }) {
  const ref = useRef()

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() + offset) * speed
    const x = a * Math.cos(t)
    const y = b * Math.sin(t)
    const z = 0
    ref.current.position.set(x, y, z)
  })

  return (
    <group rotation={[0, 0, rotationZ]}>
      <Trail width={3} length={trailLength} color={new THREE.Color(colorHex)} attenuation={(t) => t * t}>
        <mesh ref={ref}>
          <sphereGeometry args={[size]} />
          <meshBasicMaterial color={colorHex} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  )
}

// Static ellipse outline for visual reference
function EllipseOutline({ a = 6, b = 2.8, segments = 128, color = '#61dafb', opacity = 0.35, rotationZ = 0 }) {
  const points = useMemo(() => {
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2
      pts.push(new THREE.Vector3(a * Math.cos(t), b * Math.sin(t), 0))
    }
    return pts
  }, [a, b, segments])

  return (
    <group rotation={[0, 0, rotationZ]}>
      <Line points={points} color={color} transparent opacity={opacity} lineWidth={1} />
    </group>
  )
}

// React-like atomic logo: three rotated ellipses and a nucleus
function ReactLogoShootingStar({ speed = 2.2, size = 0.18, trailLength = 10 }) {
  const a = 10
  const b = 6.8
  const rotations = [0, THREE.MathUtils.degToRad(60), THREE.MathUtils.degToRad(-60)]
  const colorHex = '#61dafb'

  return (
    <group>
      {rotations.map((rz, i) => (
        <EllipseOutline key={`outline-${i}`} a={a} b={b} rotationZ={rz} />
      ))}

      {rotations.map((rz, i) => (
        <EllipseRunner
          key={`runner-${i}`}
          a={a}
          b={b}
          rotationZ={rz}
          speed={speed * (1 + i * 0.08)}
          size={size}
          trailLength={trailLength}
          colorHex={colorHex}
          offset={i * (Math.PI / 3)}
        />
      ))}

      {/* nucleus */}
      <mesh>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshBasicMaterial color={colorHex} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default ReactLogoShootingStar