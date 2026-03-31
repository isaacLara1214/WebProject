<script setup lang="ts">
import { ref } from 'vue'
import LoginForm from '@/components/forms/LoginForm.vue'
import RegisterForm from '@/components/forms/RegisterForm.vue'

const tab = ref<'login' | 'register'>('login')
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Campus Event Hub</h1>
      <p class="auth-subtitle">Manage and attend campus events</p>

      <div class="tabs">
        <button :class="{ active: tab === 'login' }" @click="tab = 'login'">Sign In</button>
        <button :class="{ active: tab === 'register' }" @click="tab = 'register'">
          Create Account
        </button>
      </div>

      <LoginForm v-if="tab === 'login'" />
      <RegisterForm v-else />
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4rem;
}

.auth-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 420px;
}

.auth-title {
  font-size: 1.4rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 0.25rem;
}

.auth-subtitle {
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.7;
  text-align: center;
  margin: 0 0 1.5rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1.5rem;
}

.tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 0.6rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--color-text);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
}

.tabs button.active {
  color: var(--vt-c-indigo);
  font-weight: 600;
  border-bottom-color: var(--vt-c-indigo);
}
</style>
