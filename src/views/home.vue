<template>
  <div class="dashboard-page">
    <section class="page-heading">
      <div>
        <p class="kicker">{{ dateLabel }}</p>
        <h1>Good morning, <em>Tefera.</em></h1>
      </div>
      <button class="primary-button" @click="openNewReminder()">+ Add reminder</button>
    </section>
    <div v-if="errorMessage" class="api-notice" role="status"><span>{{ errorMessage }}</span><button @click="store.retry">Retry connection</button></div>

    <section id="completed" class="metric-grid" aria-label="Reminder summary">
      <article class="metric-card"><span class="metric-label">Due today</span><strong class="metric-value">{{ String(dueToday.length).padStart(2, '0') }}</strong><span class="metric-note">{{ dueToday.length ? 'Needs your attention' : 'Nothing urgent' }}</span></article>
      <article class="metric-card"><span class="metric-label">This week</span><strong class="metric-value">{{ String(thisWeek.length).padStart(2, '0') }}</strong><span class="metric-note">Upcoming deadlines</span></article>
      <article class="metric-card"><span class="metric-label">Completed</span><strong class="metric-value">{{ completedCount }}</strong><span class="metric-note">Across all reminders</span></article>
      <article class="metric-card"><span class="metric-label">Completion rate</span><strong class="metric-value">{{ completionRate }}%</strong><span class="metric-note">Keep the momentum</span></article>
    </section>

    <div class="dashboard-grid">
      <section id="reminders" class="content-panel">
        <div class="panel-heading"><div><h2>Up next</h2><p class="panel-subtitle">Your deadlines and scheduled events in one place.</p></div><button class="panel-link" @click="openNewReminder()">Add new →</button></div>
        <div class="reminder-toolbar">
          <div class="filter-buttons" role="group" aria-label="Filter reminders">
            <button v-for="option in filterOptions" :key="option.value" :class="{ active: filter === option.value }" @click="filter = option.value">{{ option.label }}</button>
          </div>
          <span class="result-count">{{ visibleReminders.length }} shown</span>
        </div>
        <div v-if="!visibleReminders.length" class="empty-state">
          <strong>No reminders match this view.</strong>
          <p>Try another filter or add a new reminder to get started.</p>
          <button class="secondary-button" @click="openNewReminder()">Create reminder</button>
        </div>
        <div v-else class="agenda">
          <article v-for="reminder in visibleReminders" :key="reminder.id" class="reminder-row" :class="{ 'is-done': reminder.done }">
            <div class="reminder-date" :class="reminderTone(reminder.tag)"><strong>{{ formatDay(reminder.date) }}</strong><span>{{ formatMonth(reminder.date) }}</span></div>
            <div class="reminder-copy"><h3>{{ reminder.title }}</h3><p>{{ whenLabel(reminder) }}<span v-if="reminder.repeat !== 'None'"> · {{ reminder.repeat }}</span></p><p v-if="reminder.notes" class="reminder-notes">{{ reminder.notes }}</p></div>
            <div class="reminder-side"><span class="tag" :class="{ green: reminder.tag !== 'Important' }">{{ reminder.tag }}</span><div class="reminder-actions"><button class="action-button" :aria-label="`Edit ${reminder.title}`" @click="editReminder(reminder)">Edit</button><button class="action-button danger" :aria-label="`Delete ${reminder.title}`" @click="deleteReminder(reminder)">Delete</button><button class="complete-button" :class="{ done: reminder.done }" :aria-label="`Mark ${reminder.title} complete`" @click="store.toggleComplete(reminder.id)">{{ reminder.done ? '✓' : '' }}</button></div></div>
          </article>
        </div>
      </section>

      <section id="calendar" class="content-panel">
        <div class="panel-heading"><div><h2>{{ monthLabel }}</h2><p class="panel-subtitle">Click a day to schedule a reminder.</p></div><div class="calendar-controls"><button class="calendar-button" aria-label="Previous month" @click="store.setMonth(-1)">←</button><button class="calendar-button" aria-label="Next month" @click="store.setMonth(1)">→</button></div></div>
        <div v-for="week in calendarWeeks" :key="week[0].iso" class="calendar-week">
          <button v-for="day in week" :key="day.iso" class="calendar-day" :class="{ today: day.isToday, 'has-event': day.hasEvent, muted: !day.isCurrentMonth }" :aria-label="`Add reminder on ${day.iso}`" @click="openNewReminder(day.iso)">{{ day.label }}<strong>{{ day.date }}</strong></button>
        </div>
        <button class="today-button" @click="store.goToCurrentMonth">Jump to today</button>
        <div class="next-reminder"><div v-if="nextReminder"><span>NEXT REMINDER</span><b>{{ nextReminder.title }}</b></div><div v-else><span>ALL CLEAR</span><b>No upcoming reminders</b></div><strong>{{ daysUntilNext }}</strong></div>
        <div class="progress-block"><div class="progress-row"><b>Completion progress</b><span>{{ completedCount }} of {{ reminders.length }} complete</span></div><div class="progress-bar"><i :style="{ width: `${completionRate}%` }" /></div></div>
      </section>
    </div>

    <div class="lower-grid">
      <section class="focus-card"><p class="kicker" style="color: var(--lime)">Make room for focus</p><h2>Small reminders. More headspace.</h2><p>Daymark keeps important dates visible without becoming another thing to manage.</p><a href="#reminders">Learn how it works →</a></section>
      <section class="tip-list" aria-label="Helpful insights">
        <article class="tip-card"><span class="tip-icon">01</span><span><strong>{{ dueToday.length ? `${dueToday.length} reminder${dueToday.length === 1 ? '' : 's'} due today` : 'Nothing due today' }}</strong><span>{{ dueToday.length ? 'Start with the one that unlocks the others.' : 'Use the space for focused work.' }}</span></span></article>
        <article class="tip-card"><span class="tip-icon">02</span><span><strong>{{ thisWeek.length }} reminder{{ thisWeek.length === 1 ? '' : 's' }} this week</strong><span>There is still room for the unexpected.</span></span></article>
        <article class="tip-card"><span class="tip-icon">03</span><span><strong>{{ recurringCount }} recurring reminder{{ recurringCount === 1 ? '' : 's' }}</strong><span>{{ recurringCount ? 'Your repeating dates stay on the radar.' : 'Add a repeat schedule when a date comes back.' }}</span></span></article>
      </section>
    </div>

    <div v-if="showModal" class="modal-layer" @click.self="closeModal">
      <section class="modal" aria-labelledby="reminder-form-title">
        <div class="modal-head"><div><p class="modal-kicker">{{ editingId ? 'Update your plan' : 'Add to your workspace' }}</p><h2 id="reminder-form-title">{{ editingId ? 'Edit reminder' : 'New reminder' }}</h2></div><button class="close-button" aria-label="Close" @click="closeModal">×</button></div>
        <form class="reminder-form" @submit.prevent="saveReminder">
          <label>Reminder name<input v-model.trim="form.title" required placeholder="What should you remember?" /></label>
          <div class="form-row"><label>Date<input v-model="form.date" required type="date" /></label><label>Time<input v-model="form.time" type="time" /></label></div>
          <div class="form-row"><label>Category<select v-model="form.tag"><option>Important</option><option>Personal</option><option>Teaching</option><option>Work</option></select></label><label>Repeat<select v-model="form.repeat"><option>None</option><option>Weekly</option><option>Monthly</option><option>Yearly</option></select></label></div>
          <label>Notes<span class="optional">Optional</span><textarea v-model.trim="form.notes" rows="3" placeholder="Add context or a useful next step" /></label>
          <div class="modal-actions"><button type="button" class="secondary-button" @click="closeModal">Cancel</button><button type="submit" class="primary-button">{{ editingId ? 'Save changes' : 'Save reminder' }}</button></div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useReminderStore } from '../stores/reminders'

const store = useReminderStore()
const { reminders, filter, visibleReminders, dueToday, thisWeek, completedCount, completionRate, recurringCount, nextReminder, monthLabel, calendarWeeks, errorMessage } = storeToRefs(store)
const filterOptions = [{ value: 'all', label: 'All' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'completed', label: 'Completed' }]
const showModal = ref(false)
const editingId = ref(null)
const todayIso = toIsoDate(new Date())
const form = ref(defaultForm())

onMounted(() => store.loadReminders())

const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
const daysUntilNext = computed(() => {
  if (!nextReminder.value) return '—'
  const days = Math.round((parseDate(nextReminder.value.date) - startOfToday()) / 86400000)
  return days <= 0 ? 'Today' : `${days}d`
})

function defaultForm(date = todayIso) {
  return { title: '', date, time: '09:00', tag: 'Important', repeat: 'None', notes: '' }
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value) { return new Date(`${value}T12:00:00`) }
function startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return date }
function formatDay(value) { return parseDate(value).getDate() }
function formatMonth(value) { return parseDate(value).toLocaleDateString('en-US', { month: 'short' }) }
function formatTime(value) { return value ? new Date(`1970-01-01T${value}:00`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '' }
function whenLabel(reminder) { return `${parseDate(reminder.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}${reminder.time ? ` · ${formatTime(reminder.time)}` : ''}` }
function reminderTone(tag) { return tag === 'Personal' ? 'coral' : tag === 'Teaching' ? 'gold' : '' }

function openNewReminder(date = todayIso) {
  editingId.value = null
  form.value = defaultForm(date)
  showModal.value = true
}

function editReminder(reminder) {
  editingId.value = reminder.id
  form.value = { title: reminder.title, date: reminder.date, time: reminder.time || '', tag: reminder.tag, repeat: reminder.repeat || 'None', notes: reminder.notes || '' }
  showModal.value = true
}

function closeModal() { showModal.value = false; editingId.value = null }

function saveReminder() {
  const payload = { ...form.value }
  if (editingId.value) store.updateReminder(editingId.value, payload)
  else store.addReminder(payload)
  closeModal()
}

function deleteReminder(reminder) {
  if (window.confirm(`Delete “${reminder.title}”?`)) store.removeReminder(reminder.id)
}
</script>
