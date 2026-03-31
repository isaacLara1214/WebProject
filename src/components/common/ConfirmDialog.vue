<script setup lang="ts">
defineProps<{
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true">
        <h3 class="dialog-title">{{ title }}</h3>
        <p class="dialog-message">{{ message }}</p>
        <div class="dialog-actions">
          <button class="btn secondary" @click="emit('cancel')">Cancel</button>
          <button class="btn" :class="danger ? 'danger' : 'primary'" @click="emit('confirm')">
            {{ confirmLabel ?? 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.75rem;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.dialog-message {
  font-size: 0.9rem;
  color: var(--color-text);
  margin: 0;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn {
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 0.2s;
}

.btn.primary {
  background: var(--vt-c-indigo);
  color: #fff;
}

.btn.danger {
  background: #ef4444;
  color: #fff;
}

.btn.secondary {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn:hover {
  opacity: 0.85;
}
</style>
