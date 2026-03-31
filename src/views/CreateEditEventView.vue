<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useAuthStore } from '@/stores/auth'
import EventForm from '@/components/forms/EventForm.vue'
import type { Event } from '@/types'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const auth = useAuthStore()

const eventId = route.params.id as string | undefined
const isEdit = computed(() => !!eventId)
const existingEvent = computed(() => (eventId ? eventsStore.eventById(eventId) : undefined))

const loading = ref(false)
const error = ref('')

async function handleSubmit(payload: Omit<Event, 'id' | 'createdAt'>) {
  if (!auth.currentUser) return
  loading.value = true
  error.value = ''

  try {
    if (isEdit.value && eventId) {
      await eventsStore.updateEvent(eventId, { ...payload, organizerId: auth.currentUser.id })
      router.push(`/events/${eventId}`)
    } else {
      const newEvent = await eventsStore.createEvent({ ...payload, organizerId: auth.currentUser.id })
      router.push(`/events/${newEvent.id}`)
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
    loading.value = false
  }
}
</script>

<template>
  <div class="create-edit">
    <RouterLink to="/events" class="back-link">← Back to Events</RouterLink>

    <h1>{{ isEdit ? 'Edit Event' : 'Create Event' }}</h1>

    <div v-if="isEdit && !existingEvent" class="not-found">
      <p>Event not found.</p>
    </div>

    <template v-else>
      <p v-if="error" class="submit-error">{{ error }}</p>

      <EventForm :initial="existingEvent" :loading="loading" @submit="handleSubmit">
        <template #submit-label>
          {{ loading ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Event') }}
        </template>
      </EventForm>
    </template>
  </div>
</template>

<style scoped>
.create-edit {
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.back-link {
  font-size: 0.875rem;
  color: var(--vt-c-indigo);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

h1 {
  font-size: 1.6rem;
  margin: 0;
}

.submit-error {
  color: #ef4444;
  font-size: 0.9rem;
  margin: 0;
}

.not-found {
  color: var(--color-text);
  opacity: 0.7;
}
</style>
