import { defineStore } from 'pinia'
import { useEventsStore } from './events'
import { useRegistrationsStore } from './registrations'
import { useCheckInsStore } from './checkins'
import type { Report } from '@/types'

export const useAnalyticsStore = defineStore('analytics', () => {
  function reportForEvent(eventId: string): Report {
    const registrationsStore = useRegistrationsStore()
    const checkInsStore = useCheckInsStore()

    const registrationCount = registrationsStore.registrationsForEvent(eventId).length
    const checkInCount = checkInsStore.checkInsForEvent(eventId).length
    const attendanceRate = registrationCount > 0 ? checkInCount / registrationCount : 0
    const noShowCount = Math.max(0, registrationCount - checkInCount)
    const noShowRate = registrationCount > 0 ? noShowCount / registrationCount : 0

    return { eventId, registrationCount, checkInCount, attendanceRate, noShowCount, noShowRate }
  }

  function allEventReports(): Report[] {
    const eventsStore = useEventsStore()
    return eventsStore.events.map((e) => reportForEvent(e.id))
  }

  function organizerReports(organizerId: string): Report[] {
    const eventsStore = useEventsStore()
    return eventsStore
      .eventsByOrganizer(organizerId)
      .map((e) => reportForEvent(e.id))
  }

  return { reportForEvent, allEventReports, organizerReports }
})
