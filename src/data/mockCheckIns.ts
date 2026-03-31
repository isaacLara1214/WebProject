import type { CheckIn } from '@/types'

// Past events only — upcoming events have no check-ins yet
export const mockCheckIns: CheckIn[] = [
  // e5: Resume Writing Seminar — 2 out of 3 checked in (67% rate)
  { id: 'c1', eventId: 'e5', userId: 'u3', checkInTime: '2026-03-10T13:05:00' },
  { id: 'c2', eventId: 'e5', userId: 'u4', checkInTime: '2026-03-10T13:10:00' },
  // u5 did not check in (no-show)

  // e6: Python Bootcamp — all 3 checked in (100% rate)
  { id: 'c3', eventId: 'e6', userId: 'u3', checkInTime: '2026-03-15T09:02:00' },
  { id: 'c4', eventId: 'e6', userId: 'u4', checkInTime: '2026-03-15T09:08:00' },
  { id: 'c5', eventId: 'e6', userId: 'u5', checkInTime: '2026-03-15T09:15:00' },

  // e7: Networking Night — 1 out of 3 checked in (33% rate)
  { id: 'c6', eventId: 'e7', userId: 'u3', checkInTime: '2026-03-20T18:05:00' },
  // u4 and u5 did not check in (no-shows)
]
