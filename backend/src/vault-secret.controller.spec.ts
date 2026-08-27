import { readFileSync } from 'node:fs'
import { VaultSecretController } from './vault-secret.controller'

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}))

describe('VaultSecretController', () => {
  const controller = new VaultSecretController()

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.VAULT_AGENT_SECRET_FILE
  })

  it('returns only the secret length and SHA-256 digest', () => {
    vi.mocked(readFileSync).mockReturnValue('demo-secret\n')

    expect(controller.getMetadata()).toEqual({
      available: true,
      length: 11,
      sha256: 'cd577fe2561ebff23505db0bb006300c7cdecbd46bc0e03c449afafaca2c25bf',
    })
  })

  it('does not fail or expose data while the agent is starting', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('not ready')
    })

    expect(controller.getMetadata()).toEqual({
      available: false,
      length: 0,
      sha256: null,
    })
  })
})
