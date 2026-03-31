<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref('')
const loading = ref(false)

const rules = {
  email: { required: helpers.withMessage('Email is required', required), email: helpers.withMessage('Enter a valid email', email) },
  password: { required: helpers.withMessage('Password is required', required), minLength: helpers.withMessage('Password must be at least 6 characters', minLength(6)) },
}

const v$ = useVuelidate(rules, form)

async function submit() {
  const valid = await v$.value.$validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  const ok = auth.login(form.email, form.password)
  loading.value = false

  if (!ok) {
    error.value = 'Invalid email or password.'
    return
  }

  const redirect = route.query.redirect as string | undefined
  router.push(redirect ?? '/events')
}
</script>

<template>
  <form class="auth-form" @submit.prevent="submit">
    <div class="field">
      <label for="login-email">Email</label>
      <input
        id="login-email"
        v-model="form.email"
        type="email"
        autocomplete="email"
        placeholder="you@gsu.edu"
        :class="{ invalid: v$.email.$error }"
        @blur="v$.email.$touch"
      />
      <span v-if="v$.email.$error" class="field-error">{{ v$.email.$errors[0]?.$message }}</span>
    </div>

    <div class="field">
      <label for="login-password">Password</label>
      <input
        id="login-password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        placeholder="••••••••"
        :class="{ invalid: v$.password.$error }"
        @blur="v$.password.$touch"
      />
      <span v-if="v$.password.$error" class="field-error">{{ v$.password.$errors[0]?.$message }}</span>
    </div>

    <p v-if="error" class="submit-error">{{ error }}</p>

    <button type="submit" class="submit-btn" :disabled="loading">
      {{ loading ? 'Signing in…' : 'Sign In' }}
    </button>

    <p class="hint">Demo credentials: <code>alice@gsu.edu</code> / <code>password123</code></p>
  </form>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-heading);
}

input {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: var(--vt-c-indigo);
}

input.invalid {
  border-color: #ef4444;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
}

.submit-error {
  font-size: 0.875rem;
  color: #ef4444;
  margin: 0;
}

.submit-btn {
  padding: 0.65rem;
  background: var(--vt-c-indigo);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 0.78rem;
  color: var(--color-text);
  opacity: 0.7;
  margin: 0;
  text-align: center;
}
</style>
