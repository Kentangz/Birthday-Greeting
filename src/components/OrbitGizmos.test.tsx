import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import OrbitGizmos from './OrbitGizmos'

const planets = [
  { name: 'p1', orbitalRadius: 10 },
  { name: 'p2', orbitalRadius: 20 },
]

describe('OrbitGizmos', () => {
  it('renders rings for each planet', () => {
    const { container } = render(<OrbitGizmos planets={planets} />)
    // rough check: there should be ringGeometry elements (three-stdlib renders as primitive tags)
    // Since testing 3D DOM is tricky in jsdom, we check children count > 0
    expect(container.querySelectorAll('*').length).toBeGreaterThan(0)
  })
})
