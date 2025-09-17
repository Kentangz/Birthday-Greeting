import React from 'react'

function OrbitGizmos({ planets }) {
	return (
		<>
			{planets.map((planet) => (
				<mesh key={`${planet.name}-orbit`} rotation-x={-Math.PI / 2} receiveShadow>
					<ringGeometry args={[planet.orbitalRadius - 0.02, planet.orbitalRadius + 0.02, 128]} />
					<meshBasicMaterial color={0xffffff} transparent opacity={0.15} />
				</mesh>
			))}
		</>
	)
}

export default OrbitGizmos
