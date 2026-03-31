<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import { useRegistrationsStore } from '@/stores/registrations'
import { useCheckInsStore } from '@/stores/checkins'
import EventCard from '@/components/common/EventCard.vue'
import { format } from 'date-fns'

const auth = useAuthStore()
const eventsStore = useEventsStore()
const registrationsStore = useRegistrationsStore()
const checkInsStore = useCheckInsStore()

const isOrganizer = computed(() => auth.currentUser?.role === 'organizer')

// Attendee: events they are registered for
const myRegistrations = computed(() =>
  auth.currentUser ? registrationsStore.myRegistrations(auth.currentUser.id) : [],
)
const myRegisteredEvents = computed(() =>
  myRegistrations.value
    .map((r: { eventId: string }) => eventsStore.eventById(r.eventId))
    .filter((e: ReturnType<typeof eventsStore.eventById>) => e !== undefined),
)

// Organizer: events they created
const myCreatedEvents = computed(() =>
  auth.currentUser ? eventsStore.eventsByOrganizer(auth.currentUser.id) : [],
)

function registeredCount(eventId: string) {
  return registrationsStore.registrationsForEvent(eventId).length
}

function checkedInCount(eventId: string) {
  return checkInsStore.checkInsForEvent(eventId).length
}

function userCheckedIn(eventId: string) {
  return auth.currentUser ? checkInsStore.hasCheckedIn(eventId, auth.currentUser.id) : false
}
</script>

<template>
  <div class="my-events">
    <h1>My Events</h1>

    <!-- Attendee view -->
    <template v-if="!isOrganizer">
      <p class="subtitle">Events you have registered for.</p>

      <div v-if="myRegisteredEvents.length" class="event-grid">
        <div v-for="event in myRegisteredEvents" :key="event!.id" class="attendee-card-wrapper">
          <EventCard :event="event!" />
          <div class="checkin-status" :class="userCheckedIn(event!.id) ? 'checked-in' : 'pending'">
            {{ userCheckedIn(event!.id) ? '✅ Checked in' : '⏳ Not yet checked in' }}
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>You haven't registered for any events yet.</p>
        <RouterLink to="/events" class="browse-link">Browse upcoming events →</RouterLink>
      </div>
    </template>

    <!-- Organizer view -->
    <template v-else>
      <p class="subtitle">Events you have created.</p>

      <div v-if="myCreatedEvents.length">
        <RouterLink to="/events/create" class="create-btn">+ Create New Event</RouterLink>

        <div class="organizer-list">
          <div v-for="event in myCreatedEvents" :key="event.id" class="organizer-row">
            <div class="org-event-info">
              <RouterLink :to="`/events/${event.id}`" class="org-event-title">
                {{ event.title }}
              </RouterLink>
              <span class="org-event-date">
                {{ format(new Date(event.dateTime), 'MMM d, yyyy · h:mm a') }}
              </span>
            </div>

            <div class="org-stats">
              <div class="org-stat">
                <span class="org-stat-value">{{ registeredCount(event.id) }}</span>
                <span class="org-stat-label">Registered</span>
              </div>
              <div class="org-stat">
                <span class="org-stat-value">{{ checkedInCount(event.id) }}</span>
                <span class="org-stat-label">Checked In</span>
              </div>
              <div class="org-stat">
                <span class="org-stat-value">
                  {{
                    registeredCount(event.id) > 0
                      ? Math.round((checkedInCount(event.id) / registeredCount(event.id)) * 100) + '%'
                      : '—'
                  }}
                </span>
                <span class="org-stat-label">Rate</span>
              </div>
            </div>

            <div class="org-actions">
              <RouterLink :to="`/events/${event.id}/checkin`" class="action-link">Check-In</RouterLink>
              <RouterLink :to="`/events/${event.id}/edit`" class="action-link">Edit</RouterLink>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>You haven't created any events yet.</p>
        <RouterLink to="/events/create" class="browse-link">Create your first event →</RouterLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
.my-events {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h1 {
  font-size: 1.6rem;
  margin: 0;
}

.subtitle {
  margin: -1rem 0 0;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.7;
}

/* Attendee */
.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.attendee-card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.checkin-status {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  text-align: center;
}

.checkin-status.checked-in {
  background: #dcfce7;
  color: #15803d;
}

.checkin-status.pending {
  background: #fef9c3;
  color: #854d0e;
}

/* Organizer */
.create-btn {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.55rem 1.2rem;
  background: var(--vt-c-indigo);
  color: #fff;
  border-radius: 7px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
}

.create-btn:hover {
  opacity: 0.85;
}

.organizer-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  overflow: hidden;
}

.organizer-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.organizer-row:last-child {
  border-bottom: none;
}

.org-event-info {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.org-event-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-heading);
  text-decoration: none;
}

.org-event-title:hover {
  color: var(--vt-c-indigo);
}

.org-event-date {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
}

.org-stats {
  display: flex;
  gap: 1.5rem;
}

.org-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.org-stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-heading);
}

.org-stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text);
  opacity: 0.6;
}

.org-actions {
  display: flex;
  gap: 0.75rem;
}

.action-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vt-c-indigo);
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 5px;
}

.action-link:hover {
  background: var(--color-background-mute);
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--color-text);
  opacity: 0.7;
}

.browse-link {
  color: var(--vt-c-indigo);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
}
</style>
