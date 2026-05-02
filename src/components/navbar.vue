<template>
  <header class="bg-[#668f8a] dark:bg-gray-900 shadow-lg sticky top-0 z-50">
    <!-- Top row with flex between -->
    <div class="px-6 py-3 flex items-center justify-between">
      <!-- Left section -->
      <div class="flex items-center gap-3">
        <!-- Mobile menu button -->
        <button 
          @click="toggleMobileMenu" 
          class="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors text-white"
          aria-label="Menu"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 class="text-xl font-bold text-white whitespace-nowrap">
          Date Reminder
        </h1>
      </div>

      <!-- Center section - Desktop Search -->
      <div class="hidden md:block flex-1 max-w-md mx-8">
        <div class="relative">
          <input
            type="text"
            placeholder="Search reminders, events..."
            v-model="searchQuery"
            @input="handleSearch"
            class="w-full border-0 rounded-full px-4 py-2 pl-10 pr-4 bg-white/90 dark:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-gray-800 dark:text-white placeholder-gray-500"
          />
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Right section - Actions -->
      <div class="flex items-center gap-2">
        <!-- Dark Mode Toggle -->
        <button 
          @click="toggleDark" 
          class="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
          :aria-label="isDark ? 'Light mode' : 'Dark mode'"
        >
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>

        <!-- Notification -->
        <div class="relative notif-dropdown">
          <button 
            @click="toggleNotif" 
            class="p-2 rounded-full hover:bg-white/10 transition-colors text-white relative"
            aria-label="Notifications"
          >
            🔔
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div v-if="showNotif" class="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 rounded-lg overflow-hidden z-20">
            <div class="p-3 border-b dark:border-gray-700 font-medium text-gray-800 dark:text-white">Notifications</div>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="notif in notifications" :key="notif.id" class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-600 dark:text-gray-300">
                {{ notif.message }}
              </div>
              <div v-if="notifications.length === 0" class="p-3 text-center text-gray-500 text-sm">
                No new notifications
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Dropdown -->
        <div class="relative profile-dropdown">
          <button 
            @click="toggleProfile" 
            class="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors text-white"
          >
            <img src="/remaindericon.png" class="w-8 h-8 rounded-full object-cover border-2 border-white" />
            <span class="hidden md:block text-sm font-medium">John Doe</span>
            <svg class="hidden md:block w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="showProfile" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-xl rounded-lg overflow-hidden z-20">
            <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Profile
            </a>
            <a href="#" class="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Settings
            </a>
            <a href="#" class="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu - Mobile: left aligned, Desktop: space between -->
    <nav 
      :class="[
        'transition-all duration-300 overflow-hidden bg-[#668f8a] dark:bg-gray-900',
        mobileMenuOpen ? 'max-h-96 border-t border-white/20' : 'max-h-0'
      ]"
      class="md:max-h-full md:border-t md:border-white/20"
    >
      <div class="px-6 py-3">
        <!-- Nav Links - Mobile: left aligned, Desktop: space between -->
        <ul class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <li v-for="item in navItems" :key="item.name" class="md:flex-1">
            <a 
              :href="item.href"
              @click.prevent="setActive(item.name)"
              :class="[
                'block px-4 py-2 rounded-lg transition-all duration-200 font-medium',
                'text-left md:text-center', // Left align on mobile, center on desktop
                activeNav === item.name 
                  ? 'bg-white/20 text-white shadow-md' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              ]"
            >
              <div class="flex items-center gap-2 md:justify-center">
                <span>{{ item.icon }}</span>
                <span>{{ item.name }}</span>
              </div>
            </a>
          </li>
        </ul>

        <!-- Mobile Search -->
        <div class="md:hidden relative mt-3">
          <input
            type="text"
            placeholder="Search..."
            v-model="searchQuery"
            @input="handleSearch"
            class="w-full rounded-full px-4 py-2 pl-10 bg-white/90 dark:bg-gray-800/90 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 dark:text-white"
          />
          <svg class="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </nav>

    <!-- Search Results Dropdown -->
    <div 
      v-if="searchQuery && searchResults.length > 0" 
      class="absolute top-full left-0 right-0 mx-auto mt-1 max-w-md md:left-auto md:right-auto bg-white dark:bg-gray-800 shadow-xl border dark:border-gray-700 rounded-lg overflow-hidden z-30"
    >
      <div class="p-2">
        <div v-for="result in searchResults" :key="result.id" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer text-sm">
          {{ result.title }}
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Navigation items with icons
const navItems = [
  { name: 'Home', href: '#', icon: '🏠' },
  { name: 'About', href: '#', icon: 'ℹ️' },
  { name: 'Contact', href: '#', icon: '📞' },
  { name: 'My Appointment', href: '#', icon: '📅' }
]

// State
const showNotif = ref(false)
const showProfile = ref(false)
const isDark = ref(false)
const mobileMenuOpen = ref(false)
const activeNav = ref('Home')
const searchQuery = ref('')
const searchResults = ref([])

// Mock notifications
const notifications = ref([
  { id: 1, message: 'Reminder: Meeting at 3 PM' },
  { id: 2, message: 'Your appointment is confirmed' }
])

// Handle click outside
const handleClickOutside = (event) => {
  if (showProfile.value && !event.target.closest('.profile-dropdown')) {
    showProfile.value = false
  }
  if (showNotif.value && !event.target.closest('.notif-dropdown')) {
    showNotif.value = false
  }
}

// Search handler
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    searchResults.value = navItems
      .filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .map(item => ({ id: item.name, title: `${item.name} - ${item.icon}` }))
  } else {
    searchResults.value = []
  }
}

const setActive = (navName) => {
  activeNav.value = navName
  mobileMenuOpen.value = false
}

const toggleNotif = () => {
  showNotif.value = !showNotif.value
  showProfile.value = false
}

const toggleProfile = () => {
  showProfile.value = !showProfile.value
  showNotif.value = false
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const toggleDark = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

// Check saved theme on mount
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom scrollbar for notifications */
.max-h-64::-webkit-scrollbar {
  width: 4px;
}

.max-h-64::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.max-h-64::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}
</style>