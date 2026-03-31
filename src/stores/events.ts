import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import type { Event, EventCategory } from '@/types'

export const useEventsStore = defineStore('events', () => {
  const events = ref<Event[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  const searchQuery = ref('')
  const filterCategory = ref<EventCategory | ''>('')
  const filterDateStart = ref<Date | null>(null)
  const filterDateEnd = ref<Date | null>(null)

  async function load() {
    if (loaded.value) return
    loading.value = true
    const snap = await getDocs(collection(db, 'events'))
    events.value = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Event, 'id'>) }))
    loaded.value = true
    loading.value = false
  }

  const filteredEvents = computed(() =>
    events.value.filter((event) => {
      const q = searchQuery.value.toLowerCase()
      if (q && !event.title.toLowerCase().includes(q) && !event.location.toLowerCase().includes(q)) return false
      if (filterCategory.value && event.category !== filterCategory.value) return false
      const dt = new Date(event.dateTime)
      if (filterDateStart.value && dt < filterDateStart.value) return false
      if (filterDateEnd.value && dt > filterDateEnd.value) return false
      return true
    }),
  )

  const upcomingEvents = computed(() => {
    const now = new Date()
    return filteredEvents.value
      .filter((e) => new Date(e.dateTime) >= now)
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
  })

  const pastEvents = computed(() => {
    const now = new Date()
    return filteredEvents.value
      .filter((e) => new Date(e.dateTime) < now)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  })

  function eventById(id: string): Event | undefined {
    return events.value.find((e) => e.id === id)
  }

  function eventsByOrganizer(organizerId: string): Event[] {
    return events.value.filter((e) => e.organizerId === organizerId)
  }

  async function createEvent(payload: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const data = { ...payload, createdAt: new Date().toISOString() }
    const docRef = await addDoc(collection(db, 'events'), data)
    const newEvent: Event = { id: docRef.id, ...data }
    events.value.push(newEvent)
    return newEvent
  }

  async function updateEvent(id: string, payload: Omit<Event, 'id' | 'createdAt'>): Promise<void> {
    await updateDoc(doc(db, 'events', id), { ...payload })
    const index = events.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      const existing = events.value[index]!
      events.value[index] = { id: existing.id, createdAt: existing.createdAt, ...payload }
    }
  }

  async function deleteEvent(id: string): Promise<void> {
    await deleteDoc(doc(db, 'events', id))
    const index = events.value.findIndex((e) => e.id === id)
    if (index !== -1) events.value.splice(index, 1)
  }

  async function setCheckInCode(id: string, code: string): Promise<void> {
    await updateDoc(doc(db, 'events', id), { checkInCode: code })
    const event = events.value.find((e) => e.id === id)
    if (event) event.checkInCode = code
  }

  return {
    events,
    loading,
    loaded,
    searchQuery,
    filterCategory,
    filterDateStart,
    filterDateEnd,
    filteredEvents,
    upcomingEvents,
    pastEvents,
    eventById,
    eventsByOrganizer,
    load,
    createEvent,
    updateEvent,
    deleteEvent,
    setCheckInCode,
  }
})
