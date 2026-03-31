import { watch } from 'vue'
import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

function waitForAuthReady(auth: ReturnType<typeof useAuthStore>): Promise<void> {
  if (auth.authReady) return Promise.resolve()
  return new Promise((resolve) => {
    const stop = watch(
      () => auth.authReady,
      (ready) => { if (ready) { stop(); resolve() } },
    )
  })
}

export function setupGuards(router: Router) {
  router.beforeEach(async (to, _from) => {
    const auth = useAuthStore()

    // Wait for Firebase Auth to determine initial state before any guard logic
    await waitForAuthReady(auth)

    // Already logged in — redirect away from login page
    if (to.name === 'login' && auth.currentUser) {
      return { name: 'event-feed' }
    }

    // Route requires authentication
    if (to.meta.requiresAuth && !auth.currentUser) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    // Route requires a specific role
    if (to.meta.requiresRole && auth.currentUser?.role !== to.meta.requiresRole) {
      return { name: 'event-feed' }
    }
  })
}
