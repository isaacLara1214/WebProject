<script setup lang="ts">
defineProps<{
  status: 'registered' | 'checked-in' | 'canceled' | 'full' | 'open'
}>()
</script>

<template>
  <span class="badge" :class="status">{{ status }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
}

.registered {
  background: #dbeafe;
  color: #1d4ed8;
}

.checked-in {
  background: #dcfce7;
  color: #15803d;
}

.canceled {
  background: #fee2e2;
  color: #b91c1c;
}

.full {
  background: #fef3c7;
  color: #b45309;
}

.open {
  background: #f3f4f6;
  color: #374151;
}
</style>
