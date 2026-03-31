<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import { useRegistrationsStore } from '@/stores/registrations'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from './StatusBadge.vue'
import type { Event } from '@/types'

const props = defineProps<{
  event: Event
  registeredCount?: number
}>()

const auth = useAuthStore()
const registrationsStore = useRegistrationsStore()

const formattedDate = computed(() => format(new Date(props.event.dateTime), 'EEE, MMM d · h:mm a'))

const spotsLeft = computed(() => {
  const count = props.registeredCount ?? registrationsStore.registrationsForEvent(props.event.id).length
  return props.event.capacity - count
})

const isFull = computed(() => spotsLeft.value <= 0)

const userRegistration = computed(() =>
  auth.currentUser
    ? registrationsStore.registrationForUser(props.event.id, auth.currentUser.id)
    : undefined,
)

const categoryColors: Record<string, { bg: string; text: string }> = {
  academic: { bg: '#ede9fe', text: '#6d28d9' },
  career:   { bg: '#fef9c3', text: '#854d0e' },
  social:   { bg: '#fce7f3', text: '#9d174d' },
  sports:   { bg: '#dcfce7', text: '#15803d' },
}

const categoryStyle = computed(() => categoryColors[props.event.category] ?? { bg: '#f3f4f6', text: '#374151' })
</script>

<template>
  <RouterLink :to="`/events/${event.id}`" class="event-card">
    <div class="card-header">
      <span class="category-badge" :style="{ background: categoryStyle.bg, color: categoryStyle.text }">
        {{ event.category }}
      </span>
      <StatusBadge v-if="userRegistration" status="registered" />
      <StatusBadge v-else-if="isFull" status="full" />
    </div>

    <h3 class="card-title">{{ event.title }}</h3>

    <p class="card-meta">
      <span class="icon">📅</span> {{ formattedDate }}
    </p>
    <p class="card-meta">
      <span class="icon">📍</span> {{ event.location }}
    </p>

    <div class="card-footer">
      <span class="spots" :class="{ low: spotsLeft <= 5 && !isFull, full: isFull }">
        {{ isFull ? 'Full' : `${spotsLeft} spot${spotsLeft === 1 ? '' : 's'} left` }}
      </span>
      <span class="capacity">Cap: {{ event.capacity }}</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.event-card:hover {
  border-color: var(--vt-c-indigo);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.category-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0.25rem 0 0;
  color: var(--color-heading);
  line-height: 1.3;
}

.card-meta {
  font-size: 0.85rem;
  color: var(--color-text);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.icon {
  font-size: 0.8rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
}

.spots {
  font-size: 0.8rem;
  font-weight: 600;
  color: #15803d;
}

.spots.low {
  color: #b45309;
}

.spots.full {
  color: #b91c1c;
}

.capacity {
  font-size: 0.78rem;
  color: var(--color-text);
  opacity: 0.6;
}
</style>
