<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, helpers } from '@vuelidate/validators'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { UserRole } from '@/types'

const auth = useAuthStore()
const router = useRouter()

const form = reactive<{ name: string; email: string; password: string; role: UserRole }>({
  name: '',
  email: '',
  password: '',
  role: 'attendee',
})
const error = ref('')
const loading = ref(false)

const rules = {
  name: { required: helpers.withMessage('Name is required', required) },
  email: {
    required: helpers.withMessage('Email is required', required),
    email: helpers.withMessage('Enter a valid email', email),
  },
  password: {
    required: helpers.withMessage('Password is required', required),
    minLength: helpers.withMessage('Password must be at least 6 characters', minLength(6)),
  },
  role: { required },
}

const v$ = useVuelidate(rules, form)

async function submit() {
  const valid = await v$.value.$validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  const ok = auth.register(form.name, form.email, form.password, form.role)
  loading.value = false

  if (!ok) {
    error.value = 'An account with this email already exists.'
    return
  }

  router.push('/events')
}
</script>

<template>
  <form class="auth-form" @submit.prevent="submit">
    <div class="field">
      <label for="reg-name">Full Name</label>
      <input
        id="reg-name"
        v-model="form.name"
        type="text"
        autocomplete="name"
        placeholder="Jane Smith"
        :class="{ invalid: v$.name.$error }"
        @blur="v$.name.$touch"
      />
      <span v-if="v$.name.$error" class="field-error">{{ v$.name.$errors[0]?.$message }}</span>
    </div>

    <div class="field">
      <label for="reg-email">Email</label>
      <input
        id="reg-email"
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
      <label for="reg-password">Password</label>
      <input
        id="reg-password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        placeholder="••••••••"
        :class="{ invalid: v$.password.$error }"
        @blur="v$.password.$touch"
      />
      <span v-if="v$.password.$error" class="field-error">{{ v$.password.$errors[0]?.$message }}</span>
    </div>

    <div class="field">
      <label>Role</label>
      <div class="role-options">
        <label class="role-option">
          <input v-model="form.role" type="radio" value="attendee" />
          <span>Attendee</span>
        </label>
        <label class="role-option">
          <input v-model="form.role" type="radio" value="organizer" />
          <span>Organizer</span>
        </label>
      </div>
    </div>

    <p v-if="error" class="submit-error">{{ error }}</p>

    <button type="submit" class="submit-btn" :disabled="loading">
      {{ loading ? 'Creating account…' : 'Create Account' }}
    </button>
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

input[type='text'],
input[type='email'],
input[type='password'] {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s;
}

input[type='text']:focus,
input[type='email']:focus,
input[type='password']:focus {
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

.role-options {
  display: flex;
  gap: 1.5rem;
}

.role-option {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 400;
  cursor: pointer;
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
</style>
