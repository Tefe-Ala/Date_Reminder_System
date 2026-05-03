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
            <a 
              :href="item.href"
              @click.prevent="setActiveSidebar(item.name)"
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
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer - Now this is just the logout button -->
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

      <!-- Main Content - Removed overflow-y-auto from here -->
      <main class="flex-1 p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Content based on active navigation -->
          <div v-if="activeNav === 'Home'" class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-700 dark:text-gray-300">Total Reminders</h3>
                <p class="text-3xl font-bold text-blue-600 mt-2">24</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-700 dark:text-gray-300">Upcoming Events</h3>
                <p class="text-3xl font-bold text-green-600 mt-2">8</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 class="font-semibold text-gray-700 dark:text-gray-300">Completed</h3>
                <p class="text-3xl font-bold text-purple-600 mt-2">156</p>
              </div>
            </div>
          </div>

          <div v-else-if="activeNav === 'About'" class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">About Us</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-gray-600 dark:text-gray-300">
                Date Reminder is your personal assistant for managing important dates, events, and appointments. 
                Never miss an important deadline or celebration again!
              </p>
            </div>
          </div>

          <div v-else-if="activeNav === 'Contact'" class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Contact Us</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-gray-600 dark:text-gray-300">Email: support@datereminder.com</p>
              <p class="text-gray-600 dark:text-gray-300 mt-2">Phone: +1 (555) 123-4567</p>
              <p class="text-gray-600 dark:text-gray-300 mt-2">Address: 123 Reminder Street, Digital City, DC 12345</p>
            </div>
          </div>

          <div v-else-if="activeNav === 'My Appointment'" class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">My Appointments</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div class="divide-y dark:divide-gray-700">
                <div v-for="appointment in appointments" :key="appointment.id" class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-semibold text-gray-800 dark:text-white">{{ appointment.title }}</h3>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ appointment.date }} at {{ appointment.time }}</p>
                    </div>
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full',
                      appointment.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    ]">
                      {{ appointment.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Default content -->
          <div v-else class="space-y-4">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Welcome to Date Reminder</h2>
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p class="text-gray-600 dark:text-gray-300">Select a menu option to get started.</p>
            </div>
          </div>
        </div>
      </main>

      <!-- New System Footer Component -->
      <footer class="bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700 mt-auto">
        <div class="px-6 py-4">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <!-- Footer Brand -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">
                Date Reminder System
              </span>
            </div>
            
            <!-- Footer Links -->
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
            
            <!-- Copyright -->
            <div class="text-sm text-gray-500 dark:text-gray-400 font-bold">
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
import Navbar from './navbar.vue'

// Sidebar navigation items
const sidebarItems = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Calendar', href: '/calendar', icon: '📅' },
  { name: 'Reminders', href: '/reminders', icon: '⏰' },
  { name: 'Settings', href: '/settings', icon: '⚙️' }
]

// State
const sidebarOpen = ref(true)
const activeSidebar = ref('Dashboard')
const activeNav = ref('Home')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)

// Mock appointments data
const appointments = ref([
  { id: 1, title: 'Dentist Appointment', date: '2024-05-15', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, title: 'Team Meeting', date: '2024-05-16', time: '2:00 PM', status: 'Pending' },
  { id: 3, title: 'Doctor Checkup', date: '2024-05-18', time: '11:30 AM', status: 'Confirmed' }
])

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

// Event listener for navbar navigation changes
const handleNavChange = (event) => {
  if (event.detail && event.detail.activeNav) {
    activeNav.value = event.detail.activeNav
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  window.addEventListener('nav-change', handleNavChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('nav-change', handleNavChange)
})
</script>

<style scoped>
/* Remove scrollbar from main content and add to whole page */
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

/* Transition for main content margin */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Ensure footer stays at bottom */
.mt-auto {
  margin-top: auto;
}
</style>