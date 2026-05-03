<template>
  <div class="flex h-screen bg-[#ebcfbc] dark:bg-gray-900">
    <!-- Sidebar -->
    <aside 
      :class="[
        'fixed md:relative z-40 transition-all bg-[#c0fff4] duration-300 bg-white dark:bg-gray-800 shadow-xl',
        'flex flex-col',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
      class="h-full"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-4 bg-[#c0fff4] border-b dark:border-gray-700">
        <div class="flex items-center gap-2 overflow-hidden">
          <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex-shrink-0"></div>
          <span :class="{'hidden': !sidebarOpen}" class="font-bold text-gray-800 dark:text-white whitespace-nowrap">
            Menu
          </span>
        </div>
        <button 
          @click="toggleSidebar" 
          class="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
          :title="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'"
        >
          <svg v-if="sidebarOpen" class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <svg v-else class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Sidebar Navigation -->
      <nav class="flex-1 py-4 bg-[#c0fff4] dark:bg-gray-800 overflow-y-auto">
        <ul class="space-y-1">
          <li v-for="item in sidebarItems" :key="item.name">
            <router-link 
              :to="item.to"
              @click="setActiveSidebar(item.name)"
              :class="[
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200',
                activeSidebar === item.name 
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                !sidebarOpen && 'justify-center'
              ]"
              :title="!sidebarOpen ? item.name : ''"
            >
              <span class="text-xl flex-shrink-0">{{ item.icon }}</span>
              <span :class="{'hidden': !sidebarOpen}" class="font-medium whitespace-nowrap">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-4 border-t dark:border-gray-700">
        <a 
          href="#"
          @click.prevent="handleLogout"
          :class="[
            'flex items-center gap-3 px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
            !sidebarOpen && 'justify-center'
          ]"
          :title="!sidebarOpen ? 'Logout' : ''"
        >
          <span class="text-xl flex-shrink-0">🚪</span>
          <span :class="{'hidden': !sidebarOpen}" class="font-medium whitespace-nowrap">Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div :class="[
      'flex-1 flex flex-col transition-all duration-300',
      sidebarOpen ? 'ml-64 md:ml-0' : 'ml-20 md:ml-0'
    ]">
      <!-- Navbar Component -->
      <Navbar @toggle-sidebar="toggleSidebar" />

      <!-- Main Content -->
      <main class="flex-1 p-6 overflow-y-auto">
        <div class="max-w-7xl mx-auto">
          <router-view />
        </div>
      </main>

      <!-- System Footer -->
      <footer class="bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700 mt-auto">
        <div class="px-6 py-4">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                Date Reminder System
              </span>
            </div>
            
            <div class="flex flex-wrap gap-6">
              <a href="#" class="text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" class="text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" class="text-sm text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                Help Center
              </a>
            </div>
            
            <div class="text-sm text-gray-500 dark:text-gray-400">
              © 2024 Date Reminder. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- Mobile overlay -->
    <div 
      v-if="sidebarOpen && windowWidth < 768" 
      @click="toggleSidebar"
      class="fixed inset-0 bg-black/50 z-30 md:hidden"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './Navbar.vue'

// Sidebar navigation items with routes
const sidebarItems = [
  { name: 'Dashboard', to: '/dashboard', icon: '📊' },
  { name: 'Calendar', to: '/calendar', icon: '📅' },
  { name: 'Reminders', to: '/reminders', icon: '⏰' },
  { name: 'Settings', to: '/settings', icon: '⚙️' }
]

// State
const sidebarOpen = ref(true)
const activeSidebar = ref('Dashboard')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)

// Toggle sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Set active sidebar item
const setActiveSidebar = (itemName) => {
  activeSidebar.value = itemName
  if (windowWidth.value < 768) {
    sidebarOpen.value = false
  }
}

// Handle logout
const handleLogout = () => {
  console.log('Logging out...')
  // Add your logout logic here
}

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (window.innerWidth >= 768) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
main {
  scrollbar-width: thin;
}

main::-webkit-scrollbar {
  width: 8px;
}

main::-webkit-scrollbar-track {
  background: #f1f1f1;
}

main::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

main::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

.mt-auto {
  margin-top: auto;
}
</style>