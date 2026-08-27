import { UsersService } from './users.service'

describe('UsersService', () => {
    let service: UsersService

    beforeEach(() => {
        service = new UsersService()
    })

    it('starts with demo users', () => {
        expect(service.findAll()).toHaveLength(2)
    })

    it('creates, updates, and removes users in memory', () => {
        const user = service.create({ name: 'Test User', email: 'test@example.com' })
        expect(service.findOne(user.id)).toEqual(user)
        expect(service.update(user.id, { name: 'Updated User', email: user.email })).toEqual({
            ...user,
            name: 'Updated User',
        })
        expect(service.remove(user.id)).toEqual({ deleted: true })
        expect(service.findOne(user.id)).toBeNull()
    })

    it('searches the in-memory users with pagination and filters', async () => {
        await expect(
            service.searchUsers(
                1,
                10,
                '[{"name":"asc"}]',
                '[{"key":"name","operation":"like","value":"demo"}]',
            ),
        ).resolves.toMatchObject({
            users: [{ name: 'Demo User' }],
            total: 1,
            totalPages: 1,
        })
    })

    it('rejects invalid search parameters', async () => {
        await expect(service.searchUsers(1, 10, '{', '[]')).rejects.toThrow('Invalid query parameters')
    })
})
