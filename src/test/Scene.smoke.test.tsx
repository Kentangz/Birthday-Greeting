import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import Scene from '../components/Scene'

// Smoke test: ensure component renders without throwing
// We pass minimal required props

describe('Scene', () => {
  it('renders without crashing', () => {
    const stubRef = { current: null } as any
    const { container } = render(
      <Scene
        orbitSpeedMultiplier={1}
        audioVolume={0}
        muted={true}
        onFocusChange={() => {}}
        solarSystemExternalRef={stubRef}
      />
    )
    expect(container).toBeTruthy()
  })
})
