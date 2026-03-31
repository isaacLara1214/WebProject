<template>
  <div class="not-found-page">
    <h1 class="code">404</h1>
    <p class="message">Page not found.</p>
    <RouterLink to="/events" class="home-link">← Back to Events</RouterLink>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 6rem;
  gap: 0.75rem;
  text-align: center;
}

.code {
  font-size: 5rem;
  font-weight: 800;
  margin: 0;
  color: var(--color-heading);
  opacity: 0.15;
  line-height: 1;
}

.message {
  font-size: 1.1rem;
  color: var(--color-text);
  margin: 0;
}

.home-link {
  color: var(--vt-c-indigo);
  font-weight: 600;
  text-decoration: none;
  font-size: 0.9rem;
}

.home-link:hover {
  text-decoration: underline;
}
</style>
