<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEventsStore } from '@/stores/events'
import { useCheckInsStore } from '@/stores/checkins'
import { useRegistrationsStore } from '@/stores/registrations'
import { useAuthStore } from '@/stores/auth'
import { useCheckInCode } from '@/composables/useCheckInCode'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()
const eventsStore = useEventsStore()
const checkInsStore = useCheckInsStore()
const registrationsStore = useRegistrationsStore()
const auth = useAuthStore()

const eventId = route.params.id as string
const event = computed(() => eventsStore.eventById(eventId))

if (!event.value) router.push('/events')

const isOwner = computed(() => auth.currentUser?.id === event.value?.organizerId)

// --- Organizer side ---
const { code, qrDataUrl, generating, generate } = useCheckInCode(eventId)
const liveCheckInCount = computed(() => checkInsStore.checkInsForEvent(eventId).length)
const registeredCount = computed(() => registrationsStore.registrationsForEvent(eventId).length)

// --- Attendee side ---
const enteredCode = ref('')
const attendeeLoading = ref(false)
const attendeeMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)

function showAttendeeMessage(text: string, type: 'success' | 'error') {
  attendeeMessage.value = { text, type }
  setTimeout(() => (attendeeMessage.value = null), 5000)
}

async function handleCodeSubmit() {
  if (!auth.currentUser || !enteredCode.value.trim()) return
  attendeeLoading.value = true
  const result = await checkInsStore.checkInByCode(enteredCode.value.trim().toUpperCase(), auth.currentUser.id)
  attendeeLoading.value = false
  showAttendeeMessage(result.message, result.ok ? 'success' : 'error')
  if (result.ok) enteredCode.value = ''
}

const userCheckedIn = computed(() =>
  auth.currentUser ? checkInsStore.hasCheckedIn(eventId, auth.currentUser.id) : false,
)
</script>

<template>
  <div v-if="event" class="checkin-page">
    <RouterLink :to="`/events/${eventId}`" class="back-link">← Back to Event</RouterLink>

    <div class="page-header">
      <h1>Check-In</h1>
      <h2 class="event-name">{{ event.title }}</h2>
      <p class="event-meta">{{ format(new Date(event.dateTime), 'EEEE, MMMM d · h:mm a') }}</p>
    </div>

    <!-- Organizer Panel -->
    <div v-if="isOwner" class="panel organizer-panel">
      <h3 class="panel-title">Organizer — Manage Check-In</h3>

      <div class="live-stats">
        <div class="stat">
          <span class="stat-value">{{ liveCheckInCount }}</span>
          <span class="stat-label">Checked In</span>
        </div>
        <div class="stat-divider">/</div>
        <div class="stat">
          <span class="stat-value">{{ registeredCount }}</span>
          <span class="stat-label">Registered</span>
        </div>
        <div v-if="registeredCount > 0" class="stat-rate">
          {{ Math.round((liveCheckInCount / registeredCount) * 100) }}%
        </div>
      </div>

      <div v-if="!code" class="generate-section">
        <p class="hint">Generate a check-in code for attendees to scan or enter.</p>
        <button class="btn primary" :disabled="generating" @click="generate">
          {{ generating ? 'Generating…' : 'Generate Check-In Code' }}
        </button>
      </div>

      <div v-else class="code-section">
        <div class="code-display">{{ code }}</div>
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="Check-in QR code" class="qr-code" />
        <button class="btn secondary small" @click="generate">Regenerate Code</button>
      </div>
    </div>

    <!-- Attendee Panel -->
    <div v-else class="panel attendee-panel">
      <h3 class="panel-title">Check In to This Event</h3>

      <div v-if="userCheckedIn" class="already-checked-in">
        <span class="check-icon">✅</span>
        <p>You're checked in! See you there.</p>
      </div>

      <template v-else>
        <p class="hint">Enter the check-in code provided by the organizer.</p>

        <form class="code-form" @submit.prevent="handleCodeSubmit">
          <input
            v-model="enteredCode"
            type="text"
            class="code-input"
            placeholder="e.g. A3F7K2"
            maxlength="6"
            autocomplete="off"
            spellcheck="false"
            :disabled="attendeeLoading"
            @input="enteredCode = (enteredCode).toUpperCase()"
          />
          <button type="submit" class="btn primary" :disabled="attendeeLoading || !enteredCode.trim()">
            {{ attendeeLoading ? 'Checking in…' : 'Check In' }}
          </button>
        </form>

        <div v-if="attendeeMessage" class="flash" :class="attendeeMessage.type">
          {{ attendeeMessage.text }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.checkin-page {
  max-width: 560px;
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

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-header h1 {
  font-size: 1.6rem;
  margin: 0;
}

.event-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-heading);
}

.event-meta {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.7;
  margin: 0;
}

.panel {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-heading);
}

/* Live stats */
.live-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-heading);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-text);
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  font-size: 1.5rem;
  color: var(--color-border);
}

.stat-rate {
  margin-left: auto;
  font-size: 2rem;
  font-weight: 700;
  color: #15803d;
}

/* Code display */
.code-display {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 0.3em;
  text-align: center;
  padding: 1rem;
  background: var(--color-background);
  border: 2px dashed var(--color-border);
  border-radius: 10px;
  color: var(--color-heading);
  font-family: monospace;
}

.qr-code {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

/* Attendee */
.code-form {
  display: flex;
  gap: 0.75rem;
}

.code-input {
  flex: 1;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  background: var(--color-background);
  color: var(--color-text);
  font-family: monospace;
}

.code-input:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

.already-checked-in {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #dcfce7;
  border-radius: 8px;
}

.check-icon {
  font-size: 1.5rem;
}

.already-checked-in p {
  margin: 0;
  font-weight: 600;
  color: #15803d;
}

.hint {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.7;
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

.btn {
  padding: 0.65rem 1.4rem;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
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

.btn.small {
  padding: 0.4rem 0.9rem;
  font-size: 0.8rem;
  align-self: center;
}
</style>
