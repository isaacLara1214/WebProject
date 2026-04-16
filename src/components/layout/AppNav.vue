<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const auth = useAuthStore()
const { theme, toggle } = useTheme()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="app-nav">
    <div class="nav-brand">
      <RouterLink to="/events" class="brand-link">Campus Event Hub</RouterLink>
    </div>

    <div class="nav-links">
      <RouterLink to="/events">Events</RouterLink>
      <RouterLink v-if="auth.currentUser" to="/my-events">My Events</RouterLink>
      <RouterLink v-if="auth.currentUser?.role === 'organizer'" to="/events/create">
        Create Event
      </RouterLink>
      <RouterLink v-if="auth.currentUser?.role === 'organizer'" to="/analytics">
        Analytics
      </RouterLink>
    </div>

    <div class="nav-user">
      <template v-if="auth.currentUser">
        <label class="theme-toggle" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <input type="checkbox" class="theme-toggle-input" :checked="theme === 'light'" @change="toggle" />
          <span class="theme-toggle-track">
            <span class="theme-toggle-thumb" />
          </span>
          <i class="pi" :class="theme === 'dark' ? 'pi-moon' : 'pi-sun'" />
        </label>
        <span class="user-name">{{ auth.currentUser.name }}</span>
        <span class="role-badge" :class="auth.currentUser.role">
          {{ auth.currentUser.role }}
        </span>
        <button class="logout-btn" @click="logout">Logout</button>
      </template>
      <template v-else>
        <label class="theme-toggle" :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
          <input type="checkbox" class="theme-toggle-input" :checked="theme === 'light'" @change="toggle" />
          <span class="theme-toggle-track">
            <span class="theme-toggle-thumb" />
          </span>
          <i class="pi" :class="theme === 'dark' ? 'pi-moon' : 'pi-sun'" />
        </label>
        <RouterLink to="/login" class="login-link">Login</RouterLink>
      </template>
    </div>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1.5rem;
  height: 60px;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand-link {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-heading);
  text-decoration: none;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 1.25rem;
  flex: 1;
}

.nav-links a,
.nav-links a:visited {
  color: var(--color-text);
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-links a.router-link-active {
  color: var(--vt-c-indigo);
  font-weight: 600;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.user-name {
  font-size: 0.875rem;
  color: var(--color-text);
}

.role-badge {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.role-badge.organizer {
  background: #ede9fe;
  color: #6d28d9;
}

.role-badge.attendee {
  background: #dcfce7;
  color: #15803d;
}

.logout-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--color-text);
}

.logout-btn:hover {
  background: var(--color-background-mute);
}

.login-link {
  font-size: 0.875rem;
  color: var(--vt-c-indigo);
  text-decoration: none;
  font-weight: 600;
}

/* Theme toggle */
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  user-select: none;
}

.theme-toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.theme-toggle-track {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 18px;
  background: var(--color-background-mute);
  border: 1px solid var(--color-border-hover);
  border-radius: 9999px;
  transition: background 0.2s;
}

.theme-toggle-input:checked + .theme-toggle-track {
  background: #818cf8;
  border-color: #818cf8;
}

.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.theme-toggle-input:checked + .theme-toggle-track .theme-toggle-thumb {
  transform: translateX(16px);
}

.theme-toggle .pi {
  font-size: 0.85rem;
  color: var(--color-text);
}
</style>
