import { describe, it, expect } from 'vitest'

describe('Content server actions', () => {
  it('exports uploadContent function', async () => {
    const { uploadContent } = await import('../content')
    expect(uploadContent).toBeDefined()
    expect(typeof uploadContent).toBe('function')
  })

  it('exports getContentByLevel function', async () => {
    const { getContentByLevel } = await import('../content')
    expect(getContentByLevel).toBeDefined()
    expect(typeof getContentByLevel).toBe('function')
  })
})
