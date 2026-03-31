import type { User } from '@/types'

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Alice Organizer',
    email: 'alice@gsu.edu',
    passwordHash: 'password123',
    role: 'organizer',
  },
  {
    id: 'u2',
    name: 'Bob Organizer',
    email: 'bob@gsu.edu',
    passwordHash: 'password123',
    role: 'organizer',
  },
  {
    id: 'u3',
    name: 'Carol Student',
    email: 'carol@student.gsu.edu',
    passwordHash: 'password123',
    role: 'attendee',
  },
  {
    id: 'u4',
    name: 'David Student',
    email: 'david@student.gsu.edu',
    passwordHash: 'password123',
    role: 'attendee',
  },
  {
    id: 'u5',
    name: 'Eve Student',
    email: 'eve@student.gsu.edu',
    passwordHash: 'password123',
    role: 'attendee',
  },
]
