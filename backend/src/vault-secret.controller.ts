import { Controller, Get } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { parse } from 'dotenv'

@Controller({ path: 'vault-secret', version: '1' })
export class VaultSecretController {
  @Get()
  getMetadata() {
    const secretPath = process.env.VAULT_AGENT_SECRET_FILE ?? '/vault/output/secret'

    try {
      const parsed = parse(readFileSync(secretPath, 'utf8'))
      return {
        available: true,
        keys: Object.entries(parsed).map(([key, value]) => ({
          key,
          length: value.length,
          sha256: createHash('sha256').update(value, 'utf8').digest('hex'),
        })),
      }
    } catch {
      return {
        available: false,
        keys: [],
      }
    }
  }
}
