import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from '@/components/Dashboard'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
}))

describe('Dashboard', () => {
  test('renders a heading with the correct text', () => {
    render(<Dashboard />)
    expect(screen.getByText(/Vault secret keys/i)).toBeInTheDocument()
  })

  test('lists each secret key with its length and digest', async () => {
    render(<Dashboard />)

    expect(await screen.findByText('db_username')).toBeInTheDocument()
    expect(screen.getByText('db_password')).toBeInTheDocument()
    expect(screen.getByText('a'.repeat(64))).toBeInTheDocument()
  })
})
