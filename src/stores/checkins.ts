import { ref } from 'vue'
import { defineStore } from 'pinia'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRegistrationsStore } from './registrations'
import { useEventsStore } from './events'
import type { CheckIn } from '@/types'

export const useCheckInsStore = defineStore('checkins', () => {
  const checkIns = ref<CheckIn[]>([])
  const loaded = ref(false)
  // Maps eventId → active check-in code (session only, not persisted)
  const activeCodes = ref<Record<string, string>>({})

  async function load() {
    if (loaded.value) return
    const snap = await getDocs(collection(db, 'checkins'))
    checkIns.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CheckIn, 'id'>) }))
    loaded.value = true
  }

  function checkInsForEvent(eventId: string): CheckIn[] {
    return checkIns.value.filter((c) => c.eventId === eventId)
  }

  function hasCheckedIn(eventId: string, userId: string): boolean {
    return checkIns.value.some((c) => c.eventId === eventId && c.userId === userId)
  }

  function generateCode(eventId: string): string {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase()
    activeCodes.value[eventId] = code
    return code
  }

  function getActiveCode(eventId: string): string | null {
    return activeCodes.value[eventId] ?? null
  }

  async function checkIn(eventId: string, userId: string): Promise<{ ok: boolean; message: string }> {
    const registrationsStore = useRegistrationsStore()
    if (!registrationsStore.registrationForUser(eventId, userId)) {
      return { ok: false, message: 'You must register for this event before checking in.' }
    }
    if (hasCheckedIn(eventId, userId)) {
      return { ok: false, message: 'You have already checked in to this event.' }
    }

    const data: Omit<CheckIn, 'id'> = {
      eventId,
      userId,
      checkInTime: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'checkins'), data)
    checkIns.value.push({ id: docRef.id, ...data })
    return { ok: true, message: 'Check-in successful!' }
  }

  async function checkInByCode(code: string, userId: string): Promise<{ ok: boolean; message: string }> {
    const eventsStore = useEventsStore()
    // Look up by Firestore-persisted code first, fall back to session-only activeCodes
    const event = eventsStore.events.find((e) => e.checkInCode === code.toUpperCase())
    const eventId = event?.id ?? Object.entries(activeCodes.value).find(([, c]) => c === code)?.[0]
    if (!eventId) return { ok: false, message: 'Invalid or expired check-in code.' }
    return checkIn(eventId, userId)
  }

  return {
    checkIns,
    loaded,
    activeCodes,
    checkInsForEvent,
    hasCheckedIn,
    generateCode,
    getActiveCode,
    load,
    checkIn,
    checkInByCode,
  }
})
