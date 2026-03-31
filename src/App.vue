<script setup lang="ts">
import { onMounted } from 'vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import { useEventsStore } from '@/stores/events'
import { useRegistrationsStore } from '@/stores/registrations'
import { useCheckInsStore } from '@/stores/checkins'

const eventsStore = useEventsStore()
const registrationsStore = useRegistrationsStore()
const checkInsStore = useCheckInsStore()

onMounted(() => {
  Promise.all([eventsStore.load(), registrationsStore.load(), checkInsStore.load()])
})
</script>

<template>
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>
