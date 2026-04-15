import { ref } from 'vue'
import { useCheckInsStore } from '@/stores/checkins'
import { useEventsStore } from '@/stores/events'

export function useCheckInCode(eventId: string) {
  const checkInsStore = useCheckInsStore()
  const eventsStore = useEventsStore()

  // Restore code from Firestore-persisted event field, then fall back to session map
  const persistedCode = eventsStore.eventById(eventId)?.checkInCode ?? null
  const code = ref<string | null>(persistedCode ?? checkInsStore.getActiveCode(eventId))
  const generating = ref(false)

  async function generate() {
    generating.value = true
    const newCode = checkInsStore.generateCode(eventId)
    // Persist to Firestore so attendees on other devices can use it
    await eventsStore.setCheckInCode(eventId, newCode)
    code.value = newCode
    generating.value = false
  }

  return { code, generating, generate }
}
