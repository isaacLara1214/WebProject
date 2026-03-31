export type UserRole = 'organizer' | 'attendee'
export type EventCategory = 'academic' | 'social' | 'sports' | 'career'
export type RegistrationStatus = 'registered' | 'canceled'

export interface User {
  id: string
  name: string
  email: string
  passwordHash?: string
  role: UserRole
}

export interface Event {
  id: string
  organizerId: string
  title: string
  description: string
  location: string
  dateTime: string // ISO 8601
  capacity: number
  category: EventCategory
  createdAt: string // ISO 8601
  checkInCode?: string // set when organizer activates check-in
}

export interface Registration {
  id: string
  eventId: string
  userId: string
  status: RegistrationStatus
  createdAt: string
}

export interface CheckIn {
  id: string
  eventId: string
  userId: string
  checkInTime: string
}

export interface Report {
  eventId: string
  registrationCount: number
  checkInCount: number
  attendanceRate: number
  noShowCount: number
  noShowRate: number
}
