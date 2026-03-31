<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEventsStore } from '@/stores/events'
import { useAnalyticsStore } from '@/stores/analytics'
import AttendanceBarChart from '@/components/charts/AttendanceBarChart.vue'
import NoShowDoughnut from '@/components/charts/NoShowDoughnut.vue'
import { format } from 'date-fns'
import type { Report } from '@/types'

const auth = useAuthStore()
const eventsStore = useEventsStore()
const analyticsStore = useAnalyticsStore()

const reports = computed(() =>
  auth.currentUser ? analyticsStore.organizerReports(auth.currentUser.id) : [],
)

const eventsWithReports = computed(() =>
  reports.value
    .map((r) => ({ report: r, event: eventsStore.eventById(r.eventId) }))
    .filter((item) => item.event !== undefined),
)

// Summary cards
const totalEvents = computed(() => reports.value.length)
const totalRegistrations = computed(() => reports.value.reduce((sum, r) => sum + r.registrationCount, 0))
const totalCheckIns = computed(() => reports.value.reduce((sum, r) => sum + r.checkInCount, 0))
const overallRate = computed(() =>
  totalRegistrations.value > 0
    ? Math.round((totalCheckIns.value / totalRegistrations.value) * 100)
    : 0,
)

// Expanded row for doughnut
const expandedEventId = ref<string | null>(null)

function toggleExpand(eventId: string) {
  expandedEventId.value = expandedEventId.value === eventId ? null : eventId
}

function reportForExpanded(eventId: string): Report | undefined {
  return reports.value.find((r) => r.eventId === eventId)
}

function rateColor(rate: number) {
  if (rate >= 0.75) return '#15803d'
  if (rate >= 0.5) return '#b45309'
  return '#b91c1c'
}
</script>

<template>
  <div class="dashboard">
    <h1>Attendance Analytics</h1>

    <!-- Summary cards -->
    <div class="summary-cards">
      <div class="card">
        <span class="card-value">{{ totalEvents }}</span>
        <span class="card-label">Total Events</span>
      </div>
      <div class="card">
        <span class="card-value">{{ totalRegistrations }}</span>
        <span class="card-label">Total Registrations</span>
      </div>
      <div class="card">
        <span class="card-value">{{ totalCheckIns }}</span>
        <span class="card-label">Total Check-Ins</span>
      </div>
      <div class="card highlight">
        <span class="card-value" :style="{ color: rateColor(overallRate / 100) }">
          {{ overallRate }}%
        </span>
        <span class="card-label">Overall Attendance Rate</span>
      </div>
    </div>

    <div v-if="reports.length === 0" class="empty-state">
      <p>No events to report on yet. Create some events to see analytics here.</p>
    </div>

    <template v-else>
      <!-- Bar chart -->
      <section class="chart-section">
        <h2 class="section-title">Registrations vs. Check-Ins</h2>
        <div class="chart-card">
          <AttendanceBarChart :reports="reports" />
        </div>
      </section>

      <!-- Per-event table -->
      <section>
        <h2 class="section-title">Event Breakdown</h2>
        <div class="table-wrapper">
          <table class="events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th class="num">Registered</th>
                <th class="num">Checked In</th>
                <th class="num">Rate</th>
                <th class="num">No-Shows</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <template v-for="{ event, report } in eventsWithReports" :key="event!.id">
                <tr
                  class="table-row"
                  :class="{ expanded: expandedEventId === event!.id }"
                  @click="toggleExpand(event!.id)"
                >
                  <td class="event-name">{{ event!.title }}</td>
                  <td class="event-date">{{ format(new Date(event!.dateTime), 'MMM d, yyyy') }}</td>
                  <td class="num">{{ report.registrationCount }}</td>
                  <td class="num">{{ report.checkInCount }}</td>
                  <td class="num">
                    <span class="rate-pill" :style="{ color: rateColor(report.attendanceRate) }">
                      {{ Math.round(report.attendanceRate * 100) }}%
                    </span>
                  </td>
                  <td class="num">{{ report.noShowCount }}</td>
                  <td class="expand-icon">{{ expandedEventId === event!.id ? '▲' : '▼' }}</td>
                </tr>
                <!-- Expanded doughnut row -->
                <tr v-if="expandedEventId === event!.id" class="detail-row">
                  <td colspan="7">
                    <div class="detail-content">
                      <NoShowDoughnut :report="reportForExpanded(event!.id)!" />
                      <div class="detail-stats">
                        <p><strong>{{ report.checkInCount }}</strong> attendees checked in</p>
                        <p><strong>{{ report.noShowCount }}</strong> no-shows</p>
                        <p>
                          <strong>{{ event!.capacity - report.registrationCount }}</strong>
                          spots never filled
                        </p>
                        <RouterLink
                          v-if="new Date(event!.dateTime) >= new Date()"
                          :to="`/events/${event!.id}/checkin`"
                          class="manage-link"
                        >
                          Manage Check-In →
                        </RouterLink>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

h1 {
  font-size: 1.6rem;
  margin: 0;
}

/* Summary cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}

.card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card.highlight {
  border-color: var(--vt-c-indigo);
}

.card-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-heading);
}

.card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
  opacity: 0.65;
}

/* Chart */
.section-title {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.chart-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 1.25rem;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 10px;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.events-table thead tr {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.events-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text);
  opacity: 0.6;
  font-weight: 600;
}

.events-table th.num,
.events-table td.num {
  text-align: right;
}

.table-row {
  border-bottom: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;
}

.table-row:last-child:not(:has(+ .detail-row)) {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-background-mute);
}

.table-row.expanded {
  background: var(--color-background-soft);
}

.events-table td {
  padding: 0.85rem 1rem;
}

.event-name {
  font-weight: 600;
  color: var(--color-heading);
  max-width: 220px;
}

.event-date {
  color: var(--color-text);
  opacity: 0.75;
  white-space: nowrap;
}

.rate-pill {
  font-weight: 700;
}

.expand-icon {
  text-align: right;
  font-size: 0.7rem;
  opacity: 0.5;
}

/* Expanded detail row */
.detail-row td {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  padding: 1.5rem 1.25rem;
}

.detail-content {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}

.detail-stats {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.9rem;
}

.detail-stats p {
  margin: 0;
}

.manage-link {
  margin-top: 0.5rem;
  color: var(--vt-c-indigo);
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

.manage-link:hover {
  text-decoration: underline;
}

.empty-state {
  color: var(--color-text);
  opacity: 0.65;
}
</style>
