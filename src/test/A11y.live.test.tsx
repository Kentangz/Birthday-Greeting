import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

function LiveRegion() {
  const [text, setText] = React.useState('')
  React.useEffect(() => {
    const handler = (e) => { if (e.detail) setText(e.detail.id) }
    window.addEventListener('a11y-focus-status', handler)
    return () => window.removeEventListener('a11y-focus-status', handler)
  }, [])
  return <div aria-live="polite" aria-atomic="true">{text}</div>
}

describe('ARIA live focus status', () => {
  it('updates text when event dispatched', async () => {
    render(<LiveRegion />)
    const detail = { en: 'Focusing Earth', id: 'Fokus Bumi' }
    const ev = new CustomEvent('a11y-focus-status', { detail })
    await act(async () => {
      window.dispatchEvent(ev)
    })
    expect(await screen.findByText('Fokus Bumi')).toBeInTheDocument()
  })
})
