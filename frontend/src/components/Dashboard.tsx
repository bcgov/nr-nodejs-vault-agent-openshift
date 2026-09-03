import type { FC } from 'react'
import type { AxiosResponse } from '~/axios'
import { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import apiService from '@/service/api-service'

type SecretKeyMetadata = {
  key: string
  length: number
  sha256: string
}

type VaultSecretMetadata = {
  available: boolean
  keys: SecretKeyMetadata[]
}

const Dashboard: FC = () => {
  const [secretMetadata, setSecretMetadata] = useState<VaultSecretMetadata | null>(null)

  useEffect(() => {
    apiService
      .getAxiosInstance()
      .get('/v1/vault-secret')
      .then((response: AxiosResponse<VaultSecretMetadata>) => setSecretMetadata(response.data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <div className="min-vh-45 mh-45 mw-50 ml-4">
      <section aria-labelledby="vault-secret-heading" className="mb-4">
        <h2 id="vault-secret-heading">Vault secret keys</h2>
        {secretMetadata?.available ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Key</th>
                <th>Length</th>
                <th>SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {secretMetadata.keys.map(({ key, length, sha256 }) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{length}</td>
                  <td className="text-break font-monospace">{sha256}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Secret is not available</p>
        )}
      </section>
    </div>
  )
}

export default Dashboard
