<template>
  <div class="dashboard-page">
    <section class="page-heading">
      <div>
        <p class="kicker">{{ dateLabel }}</p>
        <h1>Good morning, <em>Tefera.</em></h1>
      </div>
      <button class="primary-button" @click="showModal = true">+ Add reminder</button>
    </section>

    <section id="completed" class="metric-grid" aria-label="Reminder summary">
      <article class="metric-card"><span class="metric-label">Due today</span><strong class="metric-value">03</strong><span class="metric-note">Keep the day light</span></article>
      <article class="metric-card"><span class="metric-label">This week</span><strong class="metric-value">08</strong><span class="metric-note">2 need attention</span></article>
      <article class="metric-card"><span class="metric-label">Completed</span><strong class="metric-value">{{ completedCount }}</strong><span class="metric-note">+12% this month</span></article>
      <article class="metric-card"><span class="metric-label">On time</span><strong class="metric-value">92%</strong><span class="metric-note">Looking good</span></article>
    </section>

    <div class="dashboard-grid">
      <section id="reminders" class="content-panel">
        <div class="panel-heading"><h2>Up next</h2><button class="panel-link" @click="showModal = true">View all →</button></div>
        <div class="agenda">
          <article v-for="reminder in reminders" :key="reminder.id" class="reminder-row">
            <div class="reminder-date" :class="reminder.tone"><strong>{{ reminder.date }}</strong><span>{{ reminder.month }}</span></div>
            <div class="reminder-copy"><h3 :style="reminder.done ? 'text-decoration: line-through; opacity: .5' : ''">{{ reminder.title }}</h3><p>{{ reminder.when }}</p></div>
            <span class="tag" :class="{ green: reminder.tag !== 'Important' }">{{ reminder.tag }}</span>
            <button class="complete-button" :class="{ done: reminder.done }" :aria-label="`Mark ${reminder.title} complete`" @click="toggleComplete(reminder)">{{ reminder.done ? '✓' : ' ' }}</button>
          </article>
        </div>
      </section>

      <section id="calendar" class="content-panel">
        <div class="panel-heading"><h2>{{ monthLabel }}</h2><button class="panel-link">Full calendar ↗</button></div>
        <div v-for="week in calendarWeeks" :key="week[0].date" class="calendar-week">
          <div v-for="day in week" :key="day.date" class="calendar-day" :class="{ today: day.date === today, 'has-event': eventDates.includes(day.date) }">
            {{ day.label }}<strong>{{ day.date }}</strong>
          </div>
        </div>
        <div class="next-reminder"><div><span>NEXT REMINDER</span><b>{{ nextReminder.title }}</b></div><strong>{{ nextReminder.date }}d</strong></div>
        <div class="progress-block"><div class="progress-row"><b>Monthly progress</b><span>{{ completedCount }} of 35 complete</span></div><div class="progress-bar"><i :style="{ width: `${Math.min(100, completedCount / 35 * 100)}%` }" /></div></div>
      </section>
    </div>

    <div class="lower-grid">
      <section class="focus-card"><p class="kicker" style="color: var(--lime)">Make room for focus</p><h2>Small reminders. More headspace.</h2><p>Daymark keeps important dates visible without becoming another thing to manage.</p><a href="#reminders">Learn how it works →</a></section>
      <section class="tip-list" aria-label="Helpful insights">
        <article class="tip-card"><span class="tip-icon">01</span><span><strong>3 reminders are due today</strong><span>Start with the one that unlocks the others.</span></span></article>
        <article class="tip-card"><span class="tip-icon">02</span><span><strong>Your week is 68% planned</strong><span>There is still room for the unexpected.</span></span></article>
        <article class="tip-card"><span class="tip-icon">03</span><span><strong>1 recurring reminder</strong><span>Monthly report is due in 8 days.</span></span></article>
      </section>
    </div>

    <div v-if="showModal" class="modal-layer" @click.self="showModal = false">
      <section class="modal" aria-labelledby="new-reminder-title">
        <div class="modal-head"><h2 id="new-reminder-title">New reminder</h2><button class="close-button" aria-label="Close" @click="showModal = false">×</button></div>
        <form class="reminder-form" @submit.prevent="saveReminder">
          <label>Reminder name<input v-model="form.title" required placeholder="What should you remember?" /></label>
          <label>Date<input v-model="form.date" required type="date" /></label>
          <label>Category<select v-model="form.tag"><option>Important</option><option>Personal</option><option>Teaching</option></select></label>
          <button type="submit">Save reminder</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const now = new Date()
const today = now.getDate()
const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(now)
const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)
const eventDates = [3, 5, 9, 12, 17, 24, 27]
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const calendarWeeks = Array.from({ length: 4 }, (_, week) =>
  Array.from({ length: 7 }, (_, index) => ({ date: week * 7 + index + 1, label: dayLabels[index] })),
)

const reminders = ref([
  { id: 1, date: 22, month: 'Sep', title: 'Submit research proposal', when: 'Today · 4:00 PM', tag: 'Important', tone: '', done: false },
  { id: 2, date: 24, month: 'Sep', title: 'Renew domain registration', when: 'Thursday · 10:30 AM', tag: 'Personal', tone: 'coral', done: false },
  { id: 3, date: 27, month: 'Sep', title: 'Prepare lecture materials', when: 'Sunday · 9:00 AM', tag: 'Teaching', tone: 'gold', done: false },
])
const showModal = ref(false)
const form = ref({ title: '', date: '', tag: 'Important' })
const completedCount = computed(() => 24 + reminders.value.filter((reminder) => reminder.done).length)
const nextReminder = computed(() => reminders.value.find((reminder) => !reminder.done) || reminders.value[0])

function toggleComplete(reminder) {
  reminder.done = !reminder.done
}

function saveReminder() {
  const date = form.value.date ? new Date(`${form.value.date}T00:00:00`) : now
  reminders.value.push({
    id: Date.now(),
    date: date.getDate(),
    month: date.toLocaleString('en-US', { month: 'short' }),
    title: form.value.title,
    when: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    tag: form.value.tag,
    tone: form.value.tag === 'Important' ? '' : 'coral',
    done: false,
  })
  form.value = { title: '', date: '', tag: 'Important' }
  showModal.value = false
}
</script>
