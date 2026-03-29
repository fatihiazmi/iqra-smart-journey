import { describe, it, expect } from 'vitest'
import { useSpeechRecognition } from '../use-speech-recognition'

describe('useSpeechRecognition', () => {
  it('is exported and is a function', () => {
    expect(useSpeechRecognition).toBeDefined()
    expect(typeof useSpeechRecognition).toBe('function')
  })
})
