<template>
  <header class="app-topbar">
    <button class="menu-button" aria-label="Open navigation" @click="emit('toggle-sidebar')">+</button>
    <span class="crumb">Workspace / <strong>Overview</strong></span>

    <div class="top-tools">
      <input v-model="searchQuery" class="search-box" placeholder="Search reminders, events..." aria-label="Search reminders" />
      <button class="icon-button" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDark">
        {{ isDark ? '☼' : '◐' }}
      </button>
      <div class="notification-wrap">
        <button class="icon-button" aria-label="Notifications" @click="showNotifications = !showNotifications">•</button>
        <div v-if="showNotifications" class="popover">
          <strong>Notifications</strong>
          <p v-for="notification in notifications" :key="notification.id">{{ notification.message }}</p>
        </div>
      </div>
      <div class="profile-wrap">
        <button class="profile-button" aria-label="Open profile menu" @click="showProfile = !showProfile">
          <img src="/remaindericon.png" alt="Tefera Alagaw" />
          <span>Tefera Alagaw</span>
          <span aria-hidden="true">⌄</span>
        </button>
        <div v-if="showProfile" class="popover profile-popover">
          <strong>Tefera Alagaw</strong>
          <p>Personal workspace</p>
          <button @click="showProfile = false">Close menu</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useReminderStore } from '../stores/reminders'

const emit = defineEmits(['toggle-sidebar'])
const reminderStore = useReminderStore()
const { searchQuery, notifications } = storeToRefs(reminderStore)
const showNotifications = ref(false)
const showProfile = ref(false)
const isDark = ref(typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark')

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.notification-wrap, .profile-wrap { position: relative; }
.popover {
  position: absolute;
  top: 46px;
  right: 0;
  z-index: 50;
  width: 260px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: var(--panel);
  padding: 14px;
  color: var(--ink);
  box-shadow: 0 18px 40px rgb(20 37 31 / 0.15);
}
.popover strong { display: block; font-size: 13px; }
.popover p { margin: 10px 0 0; color: var(--muted); font-size: 12px; line-height: 1.4; }
.profile-button { display: flex; align-items: center; gap: 8px; border: 0; border-radius: 99px; background: transparent; color: var(--ink); padding: 3px 5px 3px 3px; font-size: 13px; }
.profile-button:hover { background: rgb(11 107 89 / 0.08); }
.profile-button img { width: 32px; height: 32px; border: 2px solid var(--green); border-radius: 50%; object-fit: cover; }
.profile-popover p { margin-bottom: 12px; }
.profile-popover button { border: 0; border-radius: 99px; background: var(--green); padding: 8px 12px; color: #fff; font-size: 11px; }
@media (max-width: 720px) { .profile-button span:not(:last-child) { display: none; } }
</style>
