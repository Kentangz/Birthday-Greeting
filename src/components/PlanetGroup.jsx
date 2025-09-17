import React, { useRef, useEffect } from 'react'
import { useLoader, useFrame } from '@react-three/fiber'
import { TextureLoader, MathUtils } from 'three'
import Ring from './Ring'

function PlanetGroup({ planet, groupRef, onHover, onUnhover, onClick, onDoubleClick }) {
	const texture = useLoader(TextureLoader, planet.texturePath)
	const planetRef = useRef()

	useEffect(() => {
		if (planetRef.current) {
			planetRef.current.rotation.z = MathUtils.degToRad(planet.axialTilt || 0)
		}
	}, [planet.axialTilt])

	useFrame(() => {
		if (planetRef.current) {
			planetRef.current.rotation.y += (planet.rotationSpeed || planet.orbitalSpeed || 0.1) * 0.01
		}
	})

	return (
		<group ref={groupRef} onPointerOver={onHover} onPointerOut={onUnhover}>
			<group ref={planetRef}>
				<mesh 
					onClick={onClick}
					onDoubleClick={onDoubleClick}
					onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
					onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto' }}
					castShadow
					receiveShadow
				>
					<sphereGeometry args={[planet.size, 32, 32]} />
					<meshStandardMaterial map={texture} />
				</mesh>
			</group>
			{planet.hasRing && planet.ringTexturePath && (
				<Ring size={planet.size} ringTexturePath={planet.ringTexturePath} />
			)}
		</group>
	)
}

export default PlanetGroup
