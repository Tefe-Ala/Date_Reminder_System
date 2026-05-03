<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Total Reminders</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">24</p>
          </div>
          <div class="text-4xl">📊</div>
        </div>
        <div class="mt-4 text-sm text-green-600 dark:text-green-400">
          ↑ 12% from last month
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Upcoming Events</p>
            <p class="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">8</p>
          </div>
          <div class="text-4xl">📅</div>
        </div>
        <div class="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
          Next: Tomorrow at 2 PM
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
            <p class="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">156</p>
          </div>
          <div class="text-4xl">✅</div>
        </div>
        <div class="mt-4 text-sm text-blue-600 dark:text-blue-400">
          +23 this week
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Active Users</p>
            <p class="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">1,234</p>
          </div>
          <div class="text-4xl">👥</div>
        </div>
        <div class="mt-4 text-sm text-green-600 dark:text-green-400">
          ↑ 5% growth
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
      <div class="space-y-3">
        <div class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <p class="text-gray-600 dark:text-gray-300">✅ Completed "Team Meeting" reminder</p>
          <span class="text-xs text-gray-400 ml-auto">2 hours ago</span>
        </div>
        <div class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <p class="text-gray-600 dark:text-gray-300">📅 Added new appointment "Doctor Visit"</p>
          <span class="text-xs text-gray-400 ml-auto">Yesterday</span>
        </div>
        <div class="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <p class="text-gray-600 dark:text-gray-300">⏰ Upcoming reminder "Project Deadline"</p>
          <span class="text-xs text-gray-400 ml-auto">Tomorrow</span>
        </div>
      </div>
    </div>
  </div>
</template>