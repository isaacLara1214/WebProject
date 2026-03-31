<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

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
        <span class="user-name">{{ auth.currentUser.name }}</span>
        <span class="role-badge" :class="auth.currentUser.role">
          {{ auth.currentUser.role }}
        </span>
        <button class="logout-btn" @click="logout">Logout</button>
      </template>
      <template v-else>
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
</style>
