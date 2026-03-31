import { createRouter, createWebHashHistory } from 'vue-router'
import { setupGuards } from './guards'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresRole?: 'organizer' | 'attendee'
  }
}

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/events',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginRegisterView.vue'),
    },
    {
      path: '/events',
      name: 'event-feed',
      component: () => import('@/views/EventFeedView.vue'),
    },
    // /events/create must be defined before /events/:id
    {
      path: '/events/create',
      name: 'event-create',
      component: () => import('@/views/CreateEditEventView.vue'),
      meta: { requiresAuth: true, requiresRole: 'organizer' },
    },
    {
      path: '/events/:id',
      name: 'event-detail',
      component: () => import('@/views/EventDetailView.vue'),
    },
    {
      path: '/events/:id/edit',
      name: 'event-edit',
      component: () => import('@/views/CreateEditEventView.vue'),
      meta: { requiresAuth: true, requiresRole: 'organizer' },
    },
    {
      path: '/events/:id/checkin',
      name: 'event-checkin',
      component: () => import('@/views/CheckInView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/my-events',
      name: 'my-events',
      component: () => import('@/views/MyEventsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('@/views/AnalyticsDashboardView.vue'),
      meta: { requiresAuth: true, requiresRole: 'organizer' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

setupGuards(router)

export default router
