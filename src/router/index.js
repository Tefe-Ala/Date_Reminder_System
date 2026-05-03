import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../components/MainLayout.vue'
import Home from '../views/Home.vue'
import About from '../views/About.vue'
import Dashboard from '../views/Dashboard.vue'
// import Contact from '../views/Contact.vue'
// import MyAppointment from '../views/MyAppointment.vue'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
         {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: '/home',
        name: 'Home',
        component: Home
      },
      {
        path: '/about',
        name: 'About',
        component: About
      },
      {
        path: '/contact',
        name: 'Contact',
        component: Contact
      },
      // {
      //   path: '/my-appointment',
      //   name: 'MyAppointment',
      //   component: MyAppointment
      // },
      // {
      //   path: '/calendar',
      //   name: 'Calendar',
      //   component: () => import('../views/Calendar.vue')
      // },
      // {
      //   path: '/reminders',
      //   name: 'Reminders',
      //   component: () => import('../views/Reminders.vue')
      // },
      // {
      //   path: '/settings',
      //   name: 'Settings',
      //   component: () => import('../views/Settings.vue')
      // }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router