# Campus Event Hub

A web app for managing campus events. Organizers can create events and track attendance through a check-in system. Attendees can register for events and check in using a code provided by the organizer. The app generates real-time attendance analytics including attendance rates and no-show statistics.

**Course:** CSC 437 — Final Project
**Team:** Check In · Isaac Lara (ilara1@student.gsu.edu)
**Live Site:** https://isaaclara1214.github.io/WebProject/

---

## Features

**Organizer**
- Create, edit, and delete events (title, description, location, date/time, capacity, category)
- Generate a check-in code + QR code for each event
- View live check-in counts during the event
- View attendance analytics: attendance rate, no-show stats, registrations vs. check-ins charts

**Attendee**
- Browse and search upcoming events
- Register and cancel registration for events
- Check in using the organizer's code
- View all registered events and check-in status

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 + TypeScript + Vite |
| State | Pinia |
| Routing | Vue Router 4 (hash history) |
| Backend / Auth | Firebase Auth + Firestore |
| UI | PrimeVue 4 (Aura theme) |
| Charts | Chart.js + vue-chartjs |
| Form validation | Vuelidate |
| Date formatting | date-fns |
| QR codes | qrcode |

---

## Project Setup

```sh
npm install
```

### Development server

```sh
npm run dev
```

### Type-check, compile, and minify for production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

### Format

```sh
npm run format
```

---

## Roles

| Role | Access |
|---|---|
| **Organizer** | Create/edit/delete events, manage check-in, view analytics |
| **Attendee** | Browse events, register, check in with code |

Select your role when creating an account on the Register tab.

---

## Pages

| Route | Page | Access |
|---|---|---|
| `/events` | Event Feed | Public |
| `/events/:id` | Event Detail | Public (register requires login) |
| `/events/create` | Create Event | Organizer only |
| `/events/:id/edit` | Edit Event | Organizer only |
| `/events/:id/checkin` | Check-In | Authenticated |
| `/my-events` | My Events | Authenticated |
| `/analytics` | Analytics Dashboard | Organizer only |
| `/login` | Login / Register | Public |

---

## Architecture

```
src/
  firebase.ts              ← Firebase app, auth, and Firestore instances
  types/index.ts           ← All shared TypeScript interfaces
  stores/
    auth.ts                ← Firebase Auth, currentUser, authReady flag
    events.ts              ← Firestore events CRUD + search/filter
    registrations.ts       ← Firestore registrations, capacity guard
    checkins.ts            ← Firestore check-ins, duplicate guard
    analytics.ts           ← Derived reports (no local state)
  router/
    index.ts               ← All routes with requiresAuth / requiresRole meta
    guards.ts              ← Waits for Firebase authReady before guard logic
  composables/
    useEventFilters.ts     ← Search, category, and date range filter state
    useCheckInCode.ts      ← Generates code, persists to Firestore, builds QR
  components/
    layout/                ← AppNav, AppLayout
    common/                ← EventCard, StatusBadge, ConfirmDialog
    forms/                 ← EventForm, LoginForm, RegisterForm
    charts/                ← AttendanceBarChart, NoShowDoughnut
  views/                   ← One file per page/route
```

**Key architecture decisions:**
- Check-in codes are persisted to the event document in Firestore so they work across devices and sessions
- The `analytics` store has no local state — it derives all report data reactively from the `registrations` and `checkins` stores
- All three data stores (`events`, `registrations`, `checkins`) load from Firestore once on app mount and cache locally; mutations update Firestore first, then the local cache
- The router guard awaits `authReady` before checking auth state, preventing false redirects on page refresh while Firebase Auth initializes
