<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center">
    <div class="text-center space-y-8">
      <!-- Animated Calendar Images Carousel -->
      <div class="relative inline-block">
        <!-- Image Carousel Container -->
        <div class="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
          <!-- Calendar Images with alternating animation -->
          <div 
            v-for="(image, index) in calendarImages" 
            :key="index"
            :class="[
              'absolute inset-0 transition-all duration-1000',
              currentImageIndex === index 
                ? 'opacity-100 scale-100 rotate-0' 
                : 'opacity-0 scale-75 rotate-12'
            ]"
          >
            <img 
              :src="image.url" 
              :alt="image.alt"
              class="w-full h-full object-contain animate-float"
              :style="{ animationDelay: `${index * 0.2}s` }"
            />
          </div>
          
          <!-- Rotating ring animation -->
          <div class="absolute inset-0 -z-10">
            <div class="animate-spin-slow w-full h-full rounded-full border-4 border-blue-400/30 border-t-blue-600"></div>
          </div>
          
          <!-- Pulse ring -->
          <div class="absolute inset-0 -z-20">
            <div class="animate-pulse-ring w-full h-full rounded-full border-2 border-purple-400/50"></div>
          </div>
        </div>
        
        <!-- Image Indicators/Dots -->
        <div class="flex justify-center gap-3 mt-6">
          <button 
            v-for="(image, index) in calendarImages" 
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-2 h-2 rounded-full transition-all duration-300',
              currentImageIndex === index 
                ? 'w-6 bg-blue-600' 
                : 'bg-gray-400 hover:bg-gray-600'
            ]"
          ></button>
        </div>
      </div>

      <!-- Animated Welcome Message -->
      <div class="space-y-4">
        <div class="overflow-hidden">
          <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
            Welcome Back!
          </h1>
        </div>
        
        <div class="overflow-hidden">
          <p class="text-xl md:text-2xl text-gray-700 dark:text-gray-300 animate-slide-up">
            {{ currentGreeting }}
          </p>
        </div>
        
        <!-- Marquee animated username -->
        <div class="marquee-container overflow-hidden whitespace-nowrap py-2">
          <div class="marquee-text inline-block animate-marquee">
            <span class="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
              {{ userName }}! 👋
            </span>
            <span class="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mx-8">
              {{ userName }}! 👋
            </span>
          </div>
        </div>
        
        <div class="overflow-hidden">
          <p class="text-gray-500 dark:text-gray-400 text-lg animate-slide-up animation-delay-200">
            Stay organized with your personal Date Reminder
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// User name (you can get this from props or store)
const userName = ref('Tefera')

// Dynamic greeting based on time of day
const currentGreeting = ref('')

// Calendar images array with different styles
const calendarImages = ref([
  {
    url: 'https://cdn-icons-png.flaticon.com/512/1055/1055687.png',
    alt: 'Calendar Icon 1'
  },
  {
    url: 'https://cdn-icons-png.flaticon.com/512/833/833593.png',
    alt: 'Calendar Icon 2'
  },
  {
    url: 'https://cdn-icons-png.flaticon.com/512/2838/2838912.png',
    alt: 'Calendar Icon 3'
  },
  {
    url: 'https://cdn-icons-png.flaticon.com/512/3125/3125713.png',
    alt: 'Calendar Icon 4'
  }
])

// Current visible image index
const currentImageIndex = ref(0)

// Auto rotate images
let imageInterval = null

const updateGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) {
    currentGreeting.value = 'Good Morning'
  } else if (hour < 18) {
    currentGreeting.value = 'Good Afternoon'
  } else {
    currentGreeting.value = 'Good Evening'
  }
}

// Function to cycle through images
const rotateImages = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % calendarImages.value.length
}

// Start auto-rotation
const startImageRotation = () => {
  imageInterval = setInterval(rotateImages, 3000) // Change image every 3 seconds
}

// Stop auto-rotation
const stopImageRotation = () => {
  if (imageInterval) {
    clearInterval(imageInterval)
  }
}

// Update greeting on mount and every hour
onMounted(() => {
  updateGreeting()
  startImageRotation()
  const greetingInterval = setInterval(updateGreeting, 3600000) // Update every hour
  
  // Cleanup intervals on component unmount
  onUnmounted(() => {
    clearInterval(greetingInterval)
    stopImageRotation()
  })
})
</script>

<style scoped>
/* Floating animation for calendar */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Slow spin animation for ring */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Pulse ring animation */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.animate-pulse-ring {
  animation: pulse-ring 2s ease-out infinite;
}

/* Gradient animation for text */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 3s linear infinite;
}

/* Slide up animation */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
  opacity: 0;
}

/* Marquee animation for username */
@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  animation: marquee 10s linear infinite;
}

.marquee-container {
  width: 100%;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(128, 90, 213, 0.05) 10%,
    rgba(128, 90, 213, 0.05) 90%,
    transparent 100%
  );
  border-radius: 50px;
  padding: 12px 0;
}

.marquee-text {
  display: inline-block;
  white-space: nowrap;
  padding-left: 20px;
}

/* Animation delays */
.animation-delay-200 {
  animation-delay: 0.2s;
}

/* Optional: Add shake animation for occasional effect */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Hover effect on images */
.relative:hover .animate-float {
  animation: shake 0.5s ease-in-out;
}
</style>