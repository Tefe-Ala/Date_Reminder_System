import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '../services/api'

const STORAGE_KEY = 'daymark-reminders'

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateFromToday(offset) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + offset)
  return toIsoDate(date)
}

function createStarterReminders() {
  return [
    { id: 1, title: 'Submit research proposal', date: dateFromToday(0), time: '16:00', tag: 'Important', notes: 'Send the final PDF to the department.', repeat: 'None', done: false },
    { id: 2, title: 'Renew domain registration', date: dateFromToday(2), time: '10:30', tag: 'Personal', notes: '', repeat: 'Yearly', done: false },
    { id: 3, title: 'Prepare lecture materials', date: dateFromToday(5), time: '09:00', tag: 'Teaching', notes: 'Review the slides and print the handouts.', repeat: 'None', done: false },
    { id: 4, title: 'Monthly report', date: dateFromToday(8), time: '14:00', tag: 'Teaching', notes: '', repeat: 'Monthly', done: false },
  ]
}

function readLocalReminders() {
  if (typeof localStorage === 'undefined') return createStarterReminders()
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return Array.isArray(saved) ? saved : createStarterReminders()
  } catch {
    return createStarterReminders()
  }
}

function persistLocal(reminders) {
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

function parseDate(value) {
  return new Date(`${value}T12:00:00`)
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function normaliseReminder(reminder) {
  return { ...reminder, time: reminder.time ? reminder.time.slice(0, 5) : '' }
}

function payloadFor(reminder) {
  return {
    title: reminder.title,
    date: reminder.date,
    time: reminder.time || null,
    tag: reminder.tag,
    notes: reminder.notes || '',
    repeat: reminder.repeat || 'None',
    done: Boolean(reminder.done),
  }
}

export const useReminderStore = defineStore('reminders', () => {
  const reminders = ref(readLocalReminders())
  const searchQuery = ref('')
  const filter = ref('all')
  const activeMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const loading = ref(false)
  const loaded = ref(false)
  const errorMessage = ref('')

  const sortedReminders = computed(() => [...reminders.value].sort((a, b) => {
    const dateDifference = parseDate(a.date) - parseDate(b.date)
    if (dateDifference !== 0) return dateDifference
    return (a.time || '').localeCompare(b.time || '')
  }))

  const visibleReminders = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return sortedReminders.value.filter((reminder) => {
      const matchesQuery = !query || [reminder.title, reminder.tag, reminder.notes, reminder.repeat]
        .some((value) => value?.toLowerCase().includes(query))
      const matchesFilter = filter.value === 'all'
        || (filter.value === 'upcoming' && !reminder.done)
        || (filter.value === 'completed' && reminder.done)
      return matchesQuery && matchesFilter
    })
  })

  const dueToday = computed(() => {
    const today = toIsoDate(new Date())
    return sortedReminders.value.filter((reminder) => reminder.date === today && !reminder.done)
  })

  const thisWeek = computed(() => {
    const today = startOfToday()
    const end = new Date(today)
    end.setDate(end.getDate() + 7)
    return sortedReminders.value.filter((reminder) => {
      const date = parseDate(reminder.date)
      return date >= today && date < end
    })
  })

  const completedCount = computed(() => reminders.value.filter((reminder) => reminder.done).length)
  const completionRate = computed(() => reminders.value.length ? Math.round((completedCount.value / reminders.value.length) * 100) : 0)
  const recurringCount = computed(() => reminders.value.filter((reminder) => reminder.repeat !== 'None').length)
  const nextReminder = computed(() => sortedReminders.value.find((reminder) => !reminder.done) || null)

  const notifications = computed(() => {
    const notices = []
    if (dueToday.value.length) notices.push({ id: 'today', message: `${dueToday.value.length} reminder${dueToday.value.length === 1 ? '' : 's'} due today.` })
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowCount = sortedReminders.value.filter((reminder) => reminder.date === toIsoDate(tomorrow) && !reminder.done).length
    if (tomorrowCount) notices.push({ id: 'tomorrow', message: `${tomorrowCount} reminder${tomorrowCount === 1 ? '' : 's'} due tomorrow.` })
    if (!notices.length && nextReminder.value) notices.push({ id: 'next', message: `${nextReminder.value.title} is next on the calendar.` })
    return notices
  })

  const monthLabel = computed(() => activeMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
  const calendarWeeks = computed(() => {
    const year = activeMonth.value.getFullYear()
    const month = activeMonth.value.getMonth()
    const firstDay = new Date(year, month, 1)
    const mondayOffset = (firstDay.getDay() + 6) % 7
    const start = new Date(year, month, 1 - mondayOffset)
    const eventDates = new Set(reminders.value.map((reminder) => reminder.date))
    const today = toIsoDate(new Date())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      const iso = toIsoDate(date)
      return { date: date.getDate(), iso, label: date.toLocaleDateString('en-US', { weekday: 'narrow' }), isCurrentMonth: date.getMonth() === month, isToday: iso === today, hasEvent: eventDates.has(iso) }
    }).reduce((weeks, day, index) => {
      if (index % 7 === 0) weeks.push([])
      weeks[weeks.length - 1].push(day)
      return weeks
    }, [])
  })

  async function loadReminders(force = false) {
    if (loading.value || (loaded.value && !force)) return
    loading.value = true
    errorMessage.value = ''
    const localReminders = readLocalReminders()
    try {
      const { data } = await api.get('/reminders')
      const remoteReminders = (data.data || []).map(normaliseReminder)
      if (!remoteReminders.length && localReminders.length) {
        const migrated = await Promise.all(localReminders.map(async (reminder) => {
          const response = await api.post('/reminders', payloadFor(reminder))
          return normaliseReminder(response.data.data)
        }))
        reminders.value = migrated
      } else {
        reminders.value = remoteReminders
      }
      persistLocal(reminders.value)
    } catch (error) {
      reminders.value = localReminders
      errorMessage.value = 'The API is unavailable. Changes will stay on this device until it reconnects.'
      console.warn(error)
    } finally {
      loaded.value = true
      loading.value = false
    }
  }

  function retry() {
    return loadReminders(true)
  }

  async function addReminder(input) {
    try {
      const { data } = await api.post('/reminders', payloadFor(input))
      reminders.value.push(normaliseReminder(data.data))
    } catch (error) {
      reminders.value.push({ id: Date.now(), ...payloadFor(input) })
      errorMessage.value = 'Saved locally because the API is unavailable.'
      console.warn(error)
    }
    persistLocal(reminders.value)
  }

  async function updateReminder(id, input) {
    try {
      const { data } = await api.patch(`/reminders/${id}`, payloadFor(input))
      const index = reminders.value.findIndex((reminder) => reminder.id === id)
      if (index !== -1) reminders.value[index] = normaliseReminder(data.data)
    } catch (error) {
      const index = reminders.value.findIndex((reminder) => reminder.id === id)
      if (index !== -1) reminders.value[index] = { ...reminders.value[index], ...payloadFor(input) }
      errorMessage.value = 'Updated locally because the API is unavailable.'
      console.warn(error)
    }
    persistLocal(reminders.value)
  }

  async function removeReminder(id) {
    try {
      await api.delete(`/reminders/${id}`)
    } catch (error) {
      errorMessage.value = 'Removed locally because the API is unavailable.'
      console.warn(error)
    }
    reminders.value = reminders.value.filter((reminder) => reminder.id !== id)
    persistLocal(reminders.value)
  }

  async function toggleComplete(id) {
    const reminder = reminders.value.find((item) => item.id === id)
    if (!reminder) return
    const nextDone = !reminder.done
    reminder.done = nextDone
    try {
      const { data } = await api.patch(`/reminders/${id}`, { done: nextDone })
      Object.assign(reminder, normaliseReminder(data.data))
    } catch (error) {
      errorMessage.value = 'Updated locally because the API is unavailable.'
      console.warn(error)
    }
    persistLocal(reminders.value)
  }

  function setMonth(offset) { activeMonth.value = new Date(activeMonth.value.getFullYear(), activeMonth.value.getMonth() + offset, 1) }
  function goToCurrentMonth() { const now = new Date(); activeMonth.value = new Date(now.getFullYear(), now.getMonth(), 1) }

  return { reminders, searchQuery, filter, visibleReminders, dueToday, thisWeek, completedCount, completionRate, recurringCount, nextReminder, notifications, monthLabel, calendarWeeks, loading, loaded, errorMessage, loadReminders, retry, addReminder, updateReminder, removeReminder, toggleComplete, setMonth, goToCurrentMonth }
})
