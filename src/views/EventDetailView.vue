<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useEventsStore } from '@/stores/events'
import { useRegistrationsStore } from '@/stores/registrations'
import { useCheckInsStore } from '@/stores/checkins'
import { useAuthStore } from '@/stores/auth'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const registrationsStore = useRegistrationsStore()
const checkInsStore = useCheckInsStore()
const auth = useAuthStore()

const eventId = route.params.id as string
const event = computed(() => eventsStore.eventById(eventId))

const registeredCount = computed(() => registrationsStore.registrationsForEvent(eventId).length)
const checkInCount = computed(() => checkInsStore.checkInsForEvent(eventId).length)
const spotsLeft = computed(() => (event.value ? event.value.capacity - registeredCount.value : 0))
const isFull = computed(() => spotsLeft.value <= 0)
const isPast = computed(() => event.value ? new Date(event.value.dateTime) < new Date() : false)

const userRegistration = computed(() =>
  auth.currentUser ? registrationsStore.registrationForUser(eventId, auth.currentUser.id) : undefined,
)
const userCheckedIn = computed(() =>
  auth.currentUser ? checkInsStore.hasCheckedIn(eventId, auth.currentUser.id) : false,
)

const isOrganizer = computed(() => auth.currentUser?.role === 'organizer')
const isOwner = computed(() => auth.currentUser?.id === event.value?.organizerId)

const loading = ref(false)
const message = ref<{ text: string; type: 'success' | 'error' } | null>(null)
const showDeleteConfirm = ref(false)
const showCancelConfirm = ref(false)

async function handleDelete() {
  showDeleteConfirm.value = false
  await eventsStore.deleteEvent(eventId)
  router.push('/events')
}

async function handleCancel() {
  showCancelConfirm.value = false
  if (!auth.currentUser) return
  loading.value = true
  await registrationsStore.cancelRegistration(eventId, auth.currentUser.id)
  loading.value = false
  showMessage('Registration canceled.', 'success')
}

function showMessage(text: string, type: 'success' | 'error') {
  message.value = { text, type }
  setTimeout(() => (message.value = null), 4000)
}

async function handleRegister() {
  if (!auth.currentUser) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  loading.value = true
  const result = await registrationsStore.register(eventId, auth.currentUser.id)
  loading.value = false
  showMessage(result.message, result.ok ? 'success' : 'error')
}


</script>

<template>
  <div v-if="event" class="detail">
    <!-- Back -->
    <RouterLink to="/events" class="back-link">← Back to Events</RouterLink>

    <!-- Header -->
    <div class="detail-header">
      <div class="header-meta">
        <span
          class="category-badge"
          :style="{
            background: { academic: '#ede9fe', career: '#fef9c3', social: '#fce7f3', sports: '#dcfce7' }[event.category] ?? '#f3f4f6',
            color: { academic: '#6d28d9', career: '#854d0e', social: '#9d174d', sports: '#15803d' }[event.category] ?? '#374151',
          }"
        >{{ event.category }}</span>
        <StatusBadge v-if="userCheckedIn" status="checked-in" />
        <StatusBadge v-else-if="userRegistration" status="registered" />
        <span v-if="isPast" class="past-tag">Past Event</span>
      </div>
      <h1 class="detail-title">{{ event.title }}</h1>
    </div>

    <div class="detail-body">
      <!-- Info -->
      <div class="detail-info">
        <div class="info-row">
          <span class="info-icon">📅</span>
          <span>{{ format(new Date(event.dateTime), 'EEEE, MMMM d, yyyy · h:mm a') }}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">📍</span>
          <span>{{ event.location }}</span>
        </div>
        <div class="info-row">
          <span class="info-icon">👥</span>
          <span>
            {{ registeredCount }} registered · {{ spotsLeft }} spot{{ spotsLeft === 1 ? '' : 's' }} left
            <span v-if="isFull" class="full-tag">(Full)</span>
          </span>
        </div>
        <div v-if="isPast" class="info-row">
          <span class="info-icon">✅</span>
          <span>{{ checkInCount }} checked in</span>
        </div>
      </div>

      <!-- Description -->
      <p class="detail-description">{{ event.description }}</p>

      <!-- Message flash -->
      <div v-if="message" class="flash" :class="message.type">{{ message.text }}</div>

      <!-- Actions -->
      <div class="actions">
        <!-- Attendee actions -->
        <template v-if="!isOrganizer">
          <template v-if="!isPast">
            <button
              v-if="!userRegistration"
              class="btn primary"
              :disabled="isFull || loading"
              @click="handleRegister"
            >
              {{ loading ? 'Registering…' : isFull ? 'Event Full' : 'Register' }}
            </button>
            <template v-else>
              <RouterLink v-if="!userCheckedIn" :to="`/events/${eventId}/checkin`" class="btn primary">
                Check In
              </RouterLink>
              <button v-else class="btn checked-in-btn" disabled>Checked In ✓</button>
              <button class="btn secondary" :disabled="loading" @click="showCancelConfirm = true">
                Cancel Registration
              </button>
            </template>
          </template>
          <template v-else>
            <RouterLink v-if="userRegistration && !userCheckedIn" :to="`/events/${eventId}/checkin`" class="btn primary">
              Check In
            </RouterLink>
            <button v-else-if="userCheckedIn" class="btn checked-in-btn" disabled>Checked In ✓</button>
          </template>
        </template>

        <!-- Organizer actions -->
        <template v-if="isOwner">
          <RouterLink v-if="!isPast" :to="`/events/${eventId}/checkin`" class="btn primary">
            Manage Check-In
          </RouterLink>
          <RouterLink :to="`/events/${eventId}/edit`" class="btn secondary">Edit Event</RouterLink>
          <button class="btn danger" @click="showDeleteConfirm = true">Delete Event</button>
        </template>
      </div>
    </div>
  </div>

  <ConfirmDialog
    v-if="showDeleteConfirm"
    title="Delete Event"
    message="Are you sure you want to delete this event? This cannot be undone."
    confirm-label="Delete"
    :danger="true"
    @confirm="handleDelete"
    @cancel="showDeleteConfirm = false"
  />

  <ConfirmDialog
    v-if="showCancelConfirm"
    title="Cancel Registration"
    message="Are you sure you want to cancel your registration for this event?"
    confirm-label="Cancel Registration"
    :danger="true"
    @confirm="handleCancel"
    @cancel="showCancelConfirm = false"
  />

  <div v-else class="not-found">
    <p>Event not found.</p>
    <RouterLink to="/events">← Back to Events</RouterLink>
  </div>
</template>

<style scoped>
.detail {
  max-width: 720px;
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

.detail-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.header-meta {
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

.past-tag {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.6;
}

.detail-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1.25rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
}

.info-icon {
  width: 1.25rem;
  text-align: center;
}

.full-tag {
  color: #b91c1c;
  font-weight: 600;
}

.detail-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}

.flash {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

.flash.success {
  background: #dcfce7;
  color: #15803d;
}

.flash.error {
  background: #fee2e2;
  color: #b91c1c;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.65rem 1.4rem;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  border: none;
  transition: opacity 0.2s;
  display: inline-flex;
  align-items: center;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.primary {
  background: var(--vt-c-indigo);
  color: #fff;
}

.btn.primary:hover:not(:disabled) {
  opacity: 0.85;
}

.btn.secondary {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn.secondary:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.btn.checked-in-btn {
  background: #dcfce7;
  color: #15803d;
  cursor: default;
}

.btn.danger {
  background: none;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn.danger:hover {
  background: #fee2e2;
}

.not-found {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  color: var(--color-text);
}
</style>
