import type { Registration } from '@/types'

// Past events (e5, e6, e7) have registrations with partial check-ins for analytics
// Upcoming events (e1, e2, e3, e4) have some registrations to show counts
export const mockRegistrations: Registration[] = [
  // e5: Resume Writing Seminar — 8 registered, 6 checked in (75% rate)
  { id: 'r1', eventId: 'e5', userId: 'u3', status: 'registered', createdAt: '2026-03-01T10:00:00' },
  { id: 'r2', eventId: 'e5', userId: 'u4', status: 'registered', createdAt: '2026-03-01T11:00:00' },
  { id: 'r3', eventId: 'e5', userId: 'u5', status: 'registered', createdAt: '2026-03-02T09:00:00' },

  // e6: Python Bootcamp — 5 registered, 5 checked in (100% rate)
  { id: 'r4', eventId: 'e6', userId: 'u3', status: 'registered', createdAt: '2026-03-01T12:00:00' },
  { id: 'r5', eventId: 'e6', userId: 'u4', status: 'registered', createdAt: '2026-03-02T10:00:00' },
  { id: 'r6', eventId: 'e6', userId: 'u5', status: 'registered', createdAt: '2026-03-03T08:00:00' },

  // e7: Networking Night — 5 registered, 2 checked in (40% rate)
  { id: 'r7', eventId: 'e7', userId: 'u3', status: 'registered', createdAt: '2026-03-05T09:00:00' },
  { id: 'r8', eventId: 'e7', userId: 'u4', status: 'registered', createdAt: '2026-03-06T10:00:00' },
  { id: 'r9', eventId: 'e7', userId: 'u5', status: 'registered', createdAt: '2026-03-07T11:00:00' },

  // Upcoming events — Carol and David are registered
  { id: 'r10', eventId: 'e1', userId: 'u3', status: 'registered', createdAt: '2026-03-15T09:00:00' },
  { id: 'r11', eventId: 'e1', userId: 'u4', status: 'registered', createdAt: '2026-03-15T10:00:00' },
  { id: 'r12', eventId: 'e2', userId: 'u3', status: 'registered', createdAt: '2026-03-16T09:00:00' },
  { id: 'r13', eventId: 'e3', userId: 'u5', status: 'registered', createdAt: '2026-03-17T10:00:00' },
]
