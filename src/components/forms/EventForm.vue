<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, minValue, helpers } from '@vuelidate/validators'
import { EVENT_CATEGORIES } from '@/composables/useEventFilters'
import type { Event, EventCategory } from '@/types'

const props = defineProps<{
  initial?: Partial<Event>
  loading?: boolean
}>()

const emit = defineEmits<{
  submit: [payload: Omit<Event, 'id' | 'createdAt'>]
}>()

// Strip the "All Categories" option (value: '') from the category dropdown
const CATEGORY_OPTIONS = EVENT_CATEGORIES.filter((c) => c.value !== '')

interface FormState {
  title: string
  description: string
  location: string
  dateTime: string
  capacity: number | null
  category: EventCategory | ''
}

const form = reactive<FormState>({
  title: '',
  description: '',
  location: '',
  dateTime: '',
  capacity: null,
  category: '',
})

// Pre-populate when editing
watch(
  () => props.initial,
  (initial) => {
    if (!initial) return
    form.title = initial.title ?? ''
    form.description = initial.description ?? ''
    form.location = initial.location ?? ''
    // Convert ISO datetime to datetime-local format (YYYY-MM-DDTHH:mm)
    form.dateTime = initial.dateTime ? initial.dateTime.slice(0, 16) : ''
    form.capacity = initial.capacity ?? null
    form.category = initial.category ?? ''
  },
  { immediate: true },
)

const rules = {
  title: { required: helpers.withMessage('Title is required', required), minLength: helpers.withMessage('Title must be at least 3 characters', minLength(3)) },
  description: { required: helpers.withMessage('Description is required', required) },
  location: { required: helpers.withMessage('Location is required', required) },
  dateTime: { required: helpers.withMessage('Date and time are required', required) },
  capacity: { required: helpers.withMessage('Capacity is required', required), minValue: helpers.withMessage('Capacity must be at least 1', minValue(1)) },
  category: { required: helpers.withMessage('Category is required', required) },
}

const v$ = useVuelidate(rules, form)

async function submit() {
  const valid = await v$.value.$validate()
  if (!valid || !form.category || form.capacity === null) return

  emit('submit', {
    title: form.title,
    description: form.description,
    location: form.location,
    dateTime: new Date(form.dateTime).toISOString(),
    capacity: form.capacity,
    category: form.category as EventCategory,
    organizerId: '', // filled in by the view
  })
}
</script>

<template>
  <form class="event-form" @submit.prevent="submit">
    <div class="field">
      <label for="ev-title">Title</label>
      <input
        id="ev-title"
        v-model="form.title"
        type="text"
        placeholder="Spring Career Fair"
        :class="{ invalid: v$.title.$error }"
        @blur="v$.title.$touch"
      />
      <span v-if="v$.title.$error" class="field-error">{{ v$.title.$errors[0]?.$message }}</span>
    </div>

    <div class="field">
      <label for="ev-description">Description</label>
      <textarea
        id="ev-description"
        v-model="form.description"
        rows="4"
        placeholder="Describe the event…"
        :class="{ invalid: v$.description.$error }"
        @blur="v$.description.$touch"
      />
      <span v-if="v$.description.$error" class="field-error">{{ v$.description.$errors[0]?.$message }}</span>
    </div>

    <div class="field-row">
      <div class="field">
        <label for="ev-location">Location</label>
        <input
          id="ev-location"
          v-model="form.location"
          type="text"
          placeholder="Student Center, Room 101"
          :class="{ invalid: v$.location.$error }"
          @blur="v$.location.$touch"
        />
        <span v-if="v$.location.$error" class="field-error">{{ v$.location.$errors[0]?.$message }}</span>
      </div>

      <div class="field">
        <label for="ev-category">Category</label>
        <select
          id="ev-category"
          v-model="form.category"
          :class="{ invalid: v$.category.$error }"
          @blur="v$.category.$touch"
        >
          <option value="" disabled>Select a category</option>
          <option v-for="cat in CATEGORY_OPTIONS" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
        <span v-if="v$.category.$error" class="field-error">{{ v$.category.$errors[0]?.$message }}</span>
      </div>
    </div>

    <div class="field-row">
      <div class="field">
        <label for="ev-datetime">Date & Time</label>
        <input
          id="ev-datetime"
          v-model="form.dateTime"
          type="datetime-local"
          :class="{ invalid: v$.dateTime.$error }"
          @blur="v$.dateTime.$touch"
        />
        <span v-if="v$.dateTime.$error" class="field-error">{{ v$.dateTime.$errors[0]?.$message }}</span>
      </div>

      <div class="field">
        <label for="ev-capacity">Capacity</label>
        <input
          id="ev-capacity"
          v-model.number="form.capacity"
          type="number"
          min="1"
          placeholder="50"
          :class="{ invalid: v$.capacity.$error }"
          @blur="v$.capacity.$touch"
        />
        <span v-if="v$.capacity.$error" class="field-error">{{ v$.capacity.$errors[0]?.$message }}</span>
      </div>
    </div>

    <button type="submit" class="submit-btn" :disabled="loading">
      <slot name="submit-label">Save Event</slot>
    </button>
  </form>
</template>

<style scoped>
.event-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}

.field-row {
  display: flex;
  gap: 1rem;
}

@media (max-width: 600px) {
  .field-row {
    flex-direction: column;
  }
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

input,
textarea,
select {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.9rem;
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

input.invalid,
textarea.invalid,
select.invalid {
  border-color: #ef4444;
}

textarea {
  resize: vertical;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

.submit-btn {
  padding: 0.65rem 1.5rem;
  background: var(--vt-c-indigo);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
