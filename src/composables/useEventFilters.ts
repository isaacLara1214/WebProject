import { computed } from 'vue'
import { useEventsStore } from '@/stores/events'
import type { Event, EventCategory } from '@/types'

export const EVENT_CATEGORIES: { label: string; value: EventCategory | '' }[] = [
  { label: 'All Categories', value: '' },
  { label: 'Academic', value: 'academic' },
  { label: 'Career', value: 'career' },
  { label: 'Social', value: 'social' },
  { label: 'Sports', value: 'sports' },
]

export function useEventFilters() {
  const store = useEventsStore()

  const upcomingFiltered = computed<Event[]>(() => store.upcomingEvents)
  const pastFiltered = computed<Event[]>(() => store.pastEvents)

  function clearFilters() {
    store.searchQuery = ''
    store.filterCategory = ''
    store.filterDateStart = null
    store.filterDateEnd = null
  }

  return {
    searchQuery: computed({
      get: () => store.searchQuery,
      set: (v) => (store.searchQuery = v),
    }),
    filterCategory: computed({
      get: () => store.filterCategory,
      set: (v) => (store.filterCategory = v),
    }),
    filterDateStart: computed({
      get: () => store.filterDateStart,
      set: (v) => (store.filterDateStart = v),
    }),
    filterDateEnd: computed({
      get: () => store.filterDateEnd,
      set: (v) => (store.filterDateEnd = v),
    }),
    upcomingFiltered,
    pastFiltered,
    clearFilters,
  }
}
