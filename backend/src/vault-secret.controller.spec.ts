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

  it('returns only the key names, lengths and SHA-256 digests', () => {
    vi.mocked(readFileSync).mockReturnValue('db_username=demo-secret\ndb_password=pw\n')

    expect(controller.getMetadata()).toEqual({
      available: true,
      keys: [
        {
          key: 'db_username',
          length: 11,
          sha256: 'cd577fe2561ebff23505db0bb006300c7cdecbd46bc0e03c449afafaca2c25bf',
        },
        {
          key: 'db_password',
          length: 2,
          sha256: '30c952fab122c3f9759f02a6d95c3758b246b4fee239957b2d4fee46e26170c4',
        },
      ],
    })
  })

  it('does not fail or expose data while the agent is starting', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('not ready')
    })

    expect(controller.getMetadata()).toEqual({
      available: false,
      keys: [],
    })
  })
})
