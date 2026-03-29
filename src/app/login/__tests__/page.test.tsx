import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'

describe('Login Page', () => {
  it('renders email input', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/e-mel/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/kata laluan/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /log masuk/i })).toBeInTheDocument()
  })

  it('renders tab toggle for Guru/Admin and Pelajar', () => {
    render(<LoginPage />)
    expect(screen.getByRole('tab', { name: /guru.*admin/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /pelajar/i })).toBeInTheDocument()
  })

  it('shows student login link when Pelajar tab is selected', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const studentTab = screen.getByRole('tab', { name: /pelajar/i })
    await user.click(studentTab)

    expect(screen.getByRole('link', { name: /log masuk pelajar/i })).toHaveAttribute(
      'href',
      '/login/student'
    )
  })

  it('shows email form by default on Guru/Admin tab', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/e-mel/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kata laluan/i)).toBeInTheDocument()
  })

  it('hides email form when Pelajar tab is selected', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const studentTab = screen.getByRole('tab', { name: /pelajar/i })
    await user.click(studentTab)

    expect(screen.queryByLabelText(/e-mel/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/kata laluan/i)).not.toBeInTheDocument()
  })
})
