import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

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

function readReminders() {
  if (typeof localStorage === 'undefined') return createStarterReminders()

  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return Array.isArray(saved) ? saved : createStarterReminders()
  } catch {
    return createStarterReminders()
  }
}

function createStarterReminders() {
  return [
    { id: 1, title: 'Submit research proposal', date: dateFromToday(0), time: '16:00', tag: 'Important', notes: 'Send the final PDF to the department.', repeat: 'None', done: false },
    { id: 2, title: 'Renew domain registration', date: dateFromToday(2), time: '10:30', tag: 'Personal', notes: '', repeat: 'Yearly', done: false },
    { id: 3, title: 'Prepare lecture materials', date: dateFromToday(5), time: '09:00', tag: 'Teaching', notes: 'Review the slides and print the handouts.', repeat: 'None', done: false },
    { id: 4, title: 'Monthly report', date: dateFromToday(8), time: '14:00', tag: 'Teaching', notes: '', repeat: 'Monthly', done: false },
  ]
}

function parseDate(value) {
  return new Date(`${value}T12:00:00`)
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

export const useReminderStore = defineStore('reminders', () => {
  const reminders = ref(readReminders())
  const searchQuery = ref('')
  const filter = ref('all')
  const activeMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))

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
    if (dueToday.value.length) {
      notices.push({ id: 'today', message: `${dueToday.value.length} reminder${dueToday.value.length === 1 ? '' : 's'} due today.` })
    }
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowKey = toIsoDate(tomorrow)
    const tomorrowCount = sortedReminders.value.filter((reminder) => reminder.date === tomorrowKey && !reminder.done).length
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
      return {
        date: date.getDate(),
        iso,
        label: date.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isCurrentMonth: date.getMonth() === month,
        isToday: iso === today,
        hasEvent: eventDates.has(iso),
      }
    }).reduce((weeks, day, index) => {
      if (index % 7 === 0) weeks.push([])
      weeks[weeks.length - 1].push(day)
      return weeks
    }, [])
  })

  function persist() {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders.value))
  }

  function addReminder(input) {
    reminders.value.push({ id: Date.now(), done: false, repeat: 'None', notes: '', ...input })
    persist()
  }

  function updateReminder(id, input) {
    const index = reminders.value.findIndex((reminder) => reminder.id === id)
    if (index === -1) return
    reminders.value[index] = { ...reminders.value[index], ...input }
    persist()
  }

  function removeReminder(id) {
    reminders.value = reminders.value.filter((reminder) => reminder.id !== id)
    persist()
  }

  function toggleComplete(id) {
    const reminder = reminders.value.find((item) => item.id === id)
    if (!reminder) return
    reminder.done = !reminder.done
    persist()
  }

  function setMonth(offset) {
    activeMonth.value = new Date(activeMonth.value.getFullYear(), activeMonth.value.getMonth() + offset, 1)
  }

  function goToCurrentMonth() {
    const now = new Date()
    activeMonth.value = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return {
    reminders,
    searchQuery,
    filter,
    visibleReminders,
    dueToday,
    thisWeek,
    completedCount,
    completionRate,
    recurringCount,
    nextReminder,
    notifications,
    monthLabel,
    calendarWeeks,
    addReminder,
    updateReminder,
    removeReminder,
    toggleComplete,
    setMonth,
    goToCurrentMonth,
  }
})
