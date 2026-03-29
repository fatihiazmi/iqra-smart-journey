import { describe, it, expect } from 'vitest'

describe('Supabase client', () => {
  it('exports createClient function', async () => {
    const { createClient } = await import('../client')
    expect(createClient).toBeDefined()
    expect(typeof createClient).toBe('function')
  })
})
