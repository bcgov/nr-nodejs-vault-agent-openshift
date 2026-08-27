import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'

@Injectable()
export class UsersService {
  private users: UserDto[] = [
    { id: 1, name: 'Demo User', email: 'demo@example.com' },
    { id: 2, name: 'Sample User', email: 'sample@example.com' },
  ]
  private nextId = 3

  create(user: CreateUserDto): UserDto {
    const savedUser = { id: this.nextId++, ...user }
    this.users.push(savedUser)
    return savedUser
  }

  findAll(): UserDto[] {
    return [...this.users]
  }

  findOne(id: number): UserDto | null {
    return this.users.find((user) => user.id === id) ?? null
  }

  update(id: number, updateUserDto: UpdateUserDto): UserDto | null {
    const user = this.findOne(id)
    if (!user) {
      return null
    }
    Object.assign(user, updateUserDto)
    return user
  }

  remove(id: number): { deleted: boolean; message?: string } {
    const index = this.users.findIndex((user) => user.id === id)
    if (index === -1) {
      return { deleted: false, message: 'User not found.' }
    }
    this.users.splice(index, 1)
    return { deleted: true }
  }

  async searchUsers(
    page: number,
    limit: number,
    sort: string, // JSON string to store sort key and sort value, ex: [{"name":"desc"},{"email":"asc"}]
    filter: string, // JSON array for key, operation and value, ex: [{"key": "name", "operation": "like", "value": "Jo"}]
  ): Promise<any> {
    page = page || 1
    if (!limit || limit > 200) {
      limit = 10
    }

    let sortObj: any
    let filterObj: Array<{ key: string; operation: string; value: unknown }>
    try {
      sortObj = JSON.parse(sort)
      const parsedFilter = JSON.parse(filter)
      // Ensure filterObj is an array
      filterObj = Array.isArray(parsedFilter) ? parsedFilter : []
    } catch {
      throw new Error('Invalid query parameters')
    }
    const filteredUsers = this.users.filter((user) =>
      filterObj.every((item) => this.matchesFilter(user, item)),
    )
    const sortedUsers = this.sortUsers(filteredUsers, sortObj)
    const users = sortedUsers.slice((page - 1) * limit, page * limit)
    const count = sortedUsers.length

    return {
      users,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    }
  }

  private matchesFilter(
    user: UserDto,
    item: { key: string; operation: string; value: unknown },
  ): boolean {
    const actual = user[item.key as keyof UserDto]
    switch (item.operation) {
      case 'like':
        return String(actual).toLowerCase().includes(String(item.value).toLowerCase())
      case 'eq':
        return actual === item.value
      case 'neq':
        return actual !== item.value
      case 'gt':
        return actual > (item.value as typeof actual)
      case 'gte':
        return actual >= (item.value as typeof actual)
      case 'lt':
        return actual < (item.value as typeof actual)
      case 'lte':
        return actual <= (item.value as typeof actual)
      case 'in':
        return Array.isArray(item.value) && item.value.includes(actual)
      case 'notin':
        return Array.isArray(item.value) && !item.value.includes(actual)
      case 'isnull':
        return actual === null || actual === undefined
      default:
        return true
    }
  }

  private sortUsers(users: UserDto[], sort: unknown): UserDto[] {
    const sortEntries = Array.isArray(sort) ? sort : []
    return [...users].sort((left, right) => {
      for (const entry of sortEntries) {
        const [key, direction] = Object.entries(entry as Record<string, unknown>)[0] ?? []
        const comparison = String(left[key as keyof UserDto]).localeCompare(
          String(right[key as keyof UserDto]),
          undefined,
          { numeric: true },
        )
        if (comparison !== 0) {
          return direction === 'desc' ? -comparison : comparison
        }
      }
      return 0
    })
  }
}
