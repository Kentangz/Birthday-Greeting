import { useLoader } from '@react-three/fiber'
import React, { useRef, useEffect } from 'react'
import { TextureLoader, MathUtils } from 'three'

function Sun({ size, texturePath, axialTilt, onClick, onDoubleClick, onHover, onUnhover }) {
	const sunRef = useRef()
	const sunTexture = useLoader(TextureLoader, texturePath)

	useEffect(() => {
		if (sunRef.current) {
			sunRef.current.rotation.z = MathUtils.degToRad(axialTilt)
		}
	}, [axialTilt])

	return (
		<group
			onClick={(e) => { e.stopPropagation(); onClick?.(e) }}
			onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(e) }}
			onPointerOver={(e) => { e.stopPropagation(); onHover?.(e) }}
			onPointerOut={(e) => { e.stopPropagation(); onUnhover?.(e) }}
		>
			<mesh ref={sunRef} castShadow receiveShadow>
				<sphereGeometry args={[size, 32, 32]} />
				<meshStandardMaterial
					map={sunTexture}
					emissiveMap={sunTexture}
					emissive={0xffc100}
					emissiveIntensity={1.2}
					roughness={1.0}
					metalness={0.0}
				/>
			</mesh>
			<pointLight intensity={80} distance={10} color={0xffffff} decay={2} />
			<pointLight intensity={40} distance={300} color={0xffe9c1} decay={1} />
		</group>
	)
}

export default Sun
