import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PinPad } from '../pin-pad'

describe('PinPad', () => {
  it('renders digit buttons 0-9', () => {
    render(<PinPad onComplete={vi.fn()} />)

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole('button', { name: String(i) })).toBeInTheDocument()
    }
  })

  it('renders a delete button', () => {
    render(<PinPad onComplete={vi.fn()} />)

    expect(screen.getByRole('button', { name: /padam/i })).toBeInTheDocument()
  })

  it('shows 4 dot indicators', () => {
    render(<PinPad onComplete={vi.fn()} />)

    const dots = screen.getAllByTestId('pin-dot')
    expect(dots).toHaveLength(4)
  })

  it('fills dots as digits are entered', () => {
    render(<PinPad onComplete={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))

    const dots = screen.getAllByTestId('pin-dot')
    expect(dots[0]).toHaveAttribute('data-filled', 'true')
    expect(dots[1]).toHaveAttribute('data-filled', 'true')
    expect(dots[2]).toHaveAttribute('data-filled', 'false')
    expect(dots[3]).toHaveAttribute('data-filled', 'false')
  })

  it('calls onComplete when 4 digits are entered', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))

    expect(onComplete).toHaveBeenCalledWith('1234')
  })

  it('does not call onComplete with fewer than 4 digits', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('delete button removes last entered digit', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: /padam/i }))

    const dots = screen.getAllByTestId('pin-dot')
    expect(dots[0]).toHaveAttribute('data-filled', 'true')
    expect(dots[1]).toHaveAttribute('data-filled', 'false')

    // Now enter 3 more to complete
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))

    expect(onComplete).toHaveBeenCalledWith('1345')
  })

  it('ignores input beyond 4 digits', () => {
    const onComplete = vi.fn()
    render(<PinPad onComplete={onComplete} />)

    fireEvent.click(screen.getByRole('button', { name: '1' }))
    fireEvent.click(screen.getByRole('button', { name: '2' }))
    fireEvent.click(screen.getByRole('button', { name: '3' }))
    fireEvent.click(screen.getByRole('button', { name: '4' }))
    fireEvent.click(screen.getByRole('button', { name: '5' }))

    // Should only be called once with the first 4 digits
    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(onComplete).toHaveBeenCalledWith('1234')
  })
})
