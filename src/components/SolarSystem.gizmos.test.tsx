import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'

// Mock R3F to render children synchronously without WebGL
vi.mock('@react-three/fiber', () => ({
	__esModule: true,
	Canvas: ({ children }: any) => <>{children}</>,
	useFrame: () => {},
	useThree: () => ({ camera: { position: { length: () => 1, clone: () => ({ add: () => ({}) }), copy: () => {} }, getWorldDirection: () => ({ multiplyScalar: () => ({}) }), lookAt: () => {} } }),
}))

function renderWith(SolarSystem: any) {
	const stubRef = { current: { reset: () => Promise.resolve() } } as any
	const onFocusChange = () => {}
	const setControlsEnabled = () => {}
	return render(
		<SolarSystem
			cameraControlsRef={stubRef}
			setControlsEnabled={setControlsEnabled}
			orbitSpeedMultiplier={1}
			audioVolume={0}
			muted={true}
			onFocusChange={onFocusChange}
			autoTourEnabled={false}
		/>
	)
}

describe('SolarSystem gizmos toggle', () => {
	it('renders orbit gizmos when SHOW_GIZMOS=true', async () => {
		vi.resetModules()
		const OrbitMock = vi.fn(() => null)
		vi.doMock('../config/constants', () => ({
			CAMERA_OFFSET_MULTIPLIER: 7,
			ANIMATION_DURATION: 2.5,
			AMBIENT_LIGHT_INTENSITY: 0.1,
			SHOW_GIZMOS: true,
		}))
		vi.doMock('./OrbitGizmos', () => ({ __esModule: true, default: OrbitMock }))
		vi.doMock('./Sun', () => ({ __esModule: true, default: () => null }))
		vi.doMock('./PlanetGroup', () => ({ __esModule: true, default: () => null }))
		vi.doMock('react', async () => {
			const actual: any = await vi.importActual('react')
			return { ...actual, useEffect: () => {} }
		})
		const { default: SolarSystem } = await import('./SolarSystem.jsx')
		renderWith(SolarSystem)
		expect(OrbitMock).toHaveBeenCalled()
		vi.resetModules()
	})

	it('hides orbit gizmos when SHOW_GIZMOS=false', async () => {
		vi.resetModules()
		const OrbitMock = vi.fn(() => null)
		vi.doMock('../config/constants', () => ({
			CAMERA_OFFSET_MULTIPLIER: 7,
			ANIMATION_DURATION: 2.5,
			AMBIENT_LIGHT_INTENSITY: 0.1,
			SHOW_GIZMOS: false,
		}))
		vi.doMock('./OrbitGizmos', () => ({ __esModule: true, default: OrbitMock }))
		vi.doMock('./Sun', () => ({ __esModule: true, default: () => null }))
		vi.doMock('./PlanetGroup', () => ({ __esModule: true, default: () => null }))
		vi.doMock('react', async () => {
			const actual: any = await vi.importActual('react')
			return { ...actual, useEffect: () => {} }
		})
		const { default: SolarSystem } = await import('./SolarSystem.jsx')
		renderWith(SolarSystem)
		expect(OrbitMock).not.toHaveBeenCalled()
		vi.resetModules()
	})
})
