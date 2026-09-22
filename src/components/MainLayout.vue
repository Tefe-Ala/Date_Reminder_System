<template>
  <div class="app-shell">
    <aside class="app-sidebar" :class="{ open: sidebarOpen }">
      <RouterLink to="/home" class="brand" @click="closeSidebar">
        <span class="brand-mark">D</span>
        <span>
          <span class="brand-name">Daymark</span>
          <span class="brand-subtitle">Date reminder system</span>
        </span>
      </RouterLink>

      <p class="nav-label">Workspace</p>
      <nav class="app-nav" aria-label="Workspace">
        <RouterLink to="/home" @click="closeSidebar"><span class="nav-index">01</span>Overview</RouterLink>
        <RouterLink to="/home#calendar" @click="closeSidebar"><span class="nav-index">02</span>Calendar</RouterLink>
        <RouterLink to="/home#reminders" @click="closeSidebar"><span class="nav-index">03</span>Reminders</RouterLink>
        <RouterLink to="/home#completed" @click="closeSidebar"><span class="nav-index">04</span>Completed</RouterLink>
      </nav>

      <p class="nav-label" style="margin-top: 30px">Manage</p>
      <nav class="app-nav" aria-label="Manage">
        <RouterLink to="/about" @click="closeSidebar"><span class="nav-index">05</span>About</RouterLink>
        <RouterLink to="/contact" @click="closeSidebar"><span class="nav-index">06</span>Contact</RouterLink>
      </nav>

      <div class="account">
        <div class="profile">
          <span class="avatar">TA</span>
          <span><strong>Tefera Alagaw</strong><span>Personal workspace</span></span>
        </div>
      </div>
    </aside>

    <div v-if="sidebarOpen" class="mobile-overlay" @click="closeSidebar" />

    <div class="app-content">
      <Navbar @toggle-sidebar="toggleSidebar" />
      <main class="app-main">
        <RouterView />
      </main>
      <footer class="app-footer">
        <span>Daymark / Date Reminder System</span>
        <span class="app-footer-links">
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/contact">Contact</RouterLink>
          <a href="https://github.com/Tefe-Ala/Date_Reminder_System" target="_blank" rel="noopener">Source</a>
        </span>
        <span>© {{ new Date().getFullYear() }} Tefera Alagaw</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import Navbar from './navbar.vue'

const sidebarOpen = ref(false)

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function handleResize() {
  if (window.innerWidth >= 721) closeSidebar()
}

onMounted(() => window.addEventListener('resize', handleResize))
onUnmounted(() => window.removeEventListener('resize', handleResize))
</script>

<style scoped>
.mobile-overlay {
  position: fixed;
  inset: 0;
  z-index: 35;
  background: rgb(14 25 20 / 0.55);
}

@media (min-width: 721px) {
  .mobile-overlay { display: none; }
}
</style>
