<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-gray-800 dark:text-white">About Us</h1>
    
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="prose dark:prose-invert max-w-none">
        <p class="text-gray-600 dark:text-gray-300 text-lg mb-4">
          Date Reminder is your personal assistant for managing important dates, events, and appointments. 
          Never miss an important deadline or celebration again!
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Our Mission</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          To help people stay organized and never forget important events in their personal and professional lives.
        </p>
        
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Features</h2>
        <ul class="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
          <li>Smart reminder system with notifications</li>
          <li>Calendar integration</li>
          <li>Appointment scheduling</li>
          <li>Recurring event management</li>
          <li>Mobile and desktop friendly</li>
        </ul>
        
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Our Team</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl">
              TA
            </div>
            <h3 class="font-semibold text-gray-800 dark:text-white">Tefera Alagaw</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Founder & CEO</p>
          </div>
          
        </div>
        
        <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p class="text-blue-700 dark:text-blue-300 text-center">
            <strong>Version 2.0.0</strong> - Released may 2026
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose {
  max-width: none;
}
</style>