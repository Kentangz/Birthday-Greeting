import React from 'react'
import Planet from './Planet'

function PlanetGroup({ planet, groupRef, onHover, onUnhover, onClick, onDoubleClick }) {
	return (
		<group ref={groupRef} onPointerOver={onHover} onPointerOut={onUnhover}>
			<Planet
				{...planet}
				rotationSpeed={planet.orbitalSpeed}
				onPlanetClick={onClick}
				onPlanetDoubleClick={onDoubleClick}
			/>
		</group>
	)
}

export default PlanetGroup
