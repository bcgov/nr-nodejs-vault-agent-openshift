import { Controller, Get } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

@Controller({ path: 'vault-secret', version: '1' })
export class VaultSecretController {
  @Get()
  getMetadata() {
    const secretPath = process.env.VAULT_AGENT_SECRET_FILE ?? '/vault/output/secret'

    try {
      const secret = readFileSync(secretPath, 'utf8').trimEnd()
      return {
        available: true,
        length: secret.length,
        sha256: createHash('sha256').update(secret, 'utf8').digest('hex'),
      }
    } catch {
      return {
        available: false,
        length: 0,
        sha256: null,
      }
    }
  }
}
