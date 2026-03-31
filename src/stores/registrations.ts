import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useEventsStore } from './events'
import type { Registration } from '@/types'

export const useRegistrationsStore = defineStore('registrations', () => {
  const registrations = ref<Registration[]>([])
  const loaded = ref(false)

  async function load() {
    if (loaded.value) return
    const snap = await getDocs(collection(db, 'registrations'))
    registrations.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Registration, 'id'>) }))
    loaded.value = true
  }

  function registrationsForEvent(eventId: string): Registration[] {
    return registrations.value.filter((r) => r.eventId === eventId && r.status === 'registered')
  }

  function registrationForUser(eventId: string, userId: string): Registration | undefined {
    return registrations.value.find(
      (r) => r.eventId === eventId && r.userId === userId && r.status === 'registered',
    )
  }

  const myRegistrations = computed(() => (userId: string) =>
    registrations.value.filter((r) => r.userId === userId && r.status === 'registered'),
  )

  async function register(eventId: string, userId: string): Promise<{ ok: boolean; message: string }> {
    if (registrationForUser(eventId, userId)) {
      return { ok: false, message: 'Already registered for this event.' }
    }

    const eventsStore = useEventsStore()
    const event = eventsStore.eventById(eventId)
    if (!event) return { ok: false, message: 'Event not found.' }

    if (registrationsForEvent(eventId).length >= event.capacity) {
      return { ok: false, message: 'This event is at full capacity.' }
    }

    const data: Omit<Registration, 'id'> = {
      eventId,
      userId,
      status: 'registered',
      createdAt: new Date().toISOString(),
    }
    const docRef = await addDoc(collection(db, 'registrations'), data)
    registrations.value.push({ id: docRef.id, ...data })
    return { ok: true, message: 'Successfully registered!' }
  }

  async function cancelRegistration(eventId: string, userId: string): Promise<void> {
    const reg = registrations.value.find(
      (r) => r.eventId === eventId && r.userId === userId && r.status === 'registered',
    )
    if (!reg) return
    await updateDoc(doc(db, 'registrations', reg.id), { status: 'canceled' })
    reg.status = 'canceled'
  }

  return {
    registrations,
    loaded,
    registrationsForEvent,
    registrationForUser,
    myRegistrations,
    load,
    register,
    cancelRegistration,
  }
})
