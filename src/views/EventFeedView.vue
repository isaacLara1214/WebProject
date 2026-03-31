<script setup lang="ts">
import { useEventFilters, EVENT_CATEGORIES } from '@/composables/useEventFilters'
import EventCard from '@/components/common/EventCard.vue'

const {
  searchQuery,
  filterCategory,
  filterDateStart,
  filterDateEnd,
  upcomingFiltered,
  pastFiltered,
  clearFilters,
} = useEventFilters()

const hasFilters = () =>
  searchQuery.value || filterCategory.value || filterDateStart.value || filterDateEnd.value
</script>

<template>
  <div class="feed">
    <div class="feed-header">
      <h1>Campus Events</h1>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        v-model="searchQuery"
        type="search"
        class="search-input"
        placeholder="Search by title or location…"
      />

      <select v-model="filterCategory" class="filter-select">
        <option v-for="cat in EVENT_CATEGORIES" :key="cat.value" :value="cat.value">
          {{ cat.label }}
        </option>
      </select>

      <div class="date-range">
        <input
          :value="filterDateStart ? filterDateStart.toISOString().slice(0, 10) : ''"
          type="date"
          class="filter-select"
          placeholder="From"
          @change="(e) => filterDateStart = (e.target as HTMLInputElement).value ? new Date((e.target as HTMLInputElement).value) : null"
        />
        <input
          :value="filterDateEnd ? filterDateEnd.toISOString().slice(0, 10) : ''"
          type="date"
          class="filter-select"
          placeholder="To"
          @change="(e) => filterDateEnd = (e.target as HTMLInputElement).value ? new Date((e.target as HTMLInputElement).value) : null"
        />
      </div>

      <button v-if="hasFilters()" class="clear-btn" @click="clearFilters">Clear</button>
    </div>

    <!-- Upcoming -->
    <section>
      <h2 class="section-title">Upcoming Events</h2>
      <div v-if="upcomingFiltered.length" class="event-grid">
        <EventCard v-for="event in upcomingFiltered" :key="event.id" :event="event" />
      </div>
      <p v-else class="empty">No upcoming events match your filters.</p>
    </section>

    <!-- Past -->
    <section v-if="pastFiltered.length">
      <h2 class="section-title past">Past Events</h2>
      <div class="event-grid">
        <EventCard v-for="event in pastFiltered" :key="event.id" :event="event" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.feed {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feed-header h1 {
  margin: 0;
  font-size: 1.6rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--color-background);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

.filter-select {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.875rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

.date-range {
  display: flex;
  gap: 0.5rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: none;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text);
}

.clear-btn:hover {
  background: var(--color-background-mute);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem;
  color: var(--color-heading);
}

.section-title.past {
  opacity: 0.6;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.empty {
  color: var(--color-text);
  opacity: 0.6;
  font-size: 0.9rem;
}
</style>
