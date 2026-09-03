import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const vaultSecret = {
  available: true,
  keys: [
    { key: 'db_username', length: 11, sha256: 'a'.repeat(64) },
    { key: 'db_password', length: 2, sha256: 'b'.repeat(64) },
  ],
}

export const restHandlers = [
  http.get('http://localhost:3000/api/v1/vault-secret', () => {
    return new HttpResponse(JSON.stringify(vaultSecret), {
      status: 200,
    })
  }),
]

const server = setupServer(...restHandlers)

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

//  Close server after all tests
afterAll(() => server.close())

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers())
