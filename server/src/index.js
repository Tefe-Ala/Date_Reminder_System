import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { createClient } from '@supabase/supabase-js'

const app = express()
const port = Number(process.env.PORT || 10000)
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const tags = new Set(['Important', 'Personal', 'Teaching', 'Work'])
const repeats = new Set(['None', 'Weekly', 'Monthly', 'Yearly'])
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
const telegramChatId = process.env.TELEGRAM_CHAT_ID
const notificationCronSecret = process.env.NOTIFICATION_CRON_SECRET
const notificationLeadMinutes = positiveMinutes(process.env.NOTIFICATION_LEAD_MINUTES, 30)
const notificationIntervalMinutes = positiveMinutes(process.env.NOTIFICATION_INTERVAL_MINUTES, 5)
const notificationTimezone = process.env.NOTIFICATION_TIMEZONE || 'UTC'

function positiveMinutes(value, fallback) {
  const minutes = Number(value)
  return Number.isFinite(minutes) && minutes > 0 ? Math.min(minutes, 24 * 60) : fallback
}

try {
  new Intl.DateTimeFormat('en-US', { timeZone: notificationTimezone }).format()
} catch {
  console.error(`Invalid NOTIFICATION_TIMEZONE: ${notificationTimezone}`)
  process.exit(1)
}

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '20kb' }))

function workspaceId(req, res, next) {
  const value = String(req.header('x-workspace-id') || '').trim()
  if (!/^[a-zA-Z0-9:_-]{8,120}$/.test(value)) {
    return res.status(400).json({ error: 'A valid x-workspace-id header is required.' })
  }
  req.workspaceId = value
  next()
}

function reminderInput(body, partial = false) {
  const input = {}
  if (!partial || body.title !== undefined) {
    const title = String(body.title || '').trim()
    if (!title || title.length > 160) throw new Error('Title must be between 1 and 160 characters.')
    input.title = title
  }
  if (!partial || body.date !== undefined) {
    const date = String(body.date || '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Date must use YYYY-MM-DD format.')
    input.date = date
  }
  if (!partial || body.time !== undefined) {
    const time = body.time ? String(body.time) : null
    if (time && !/^\d{2}:\d{2}$/.test(time)) throw new Error('Time must use HH:MM format.')
    input.time = time
  }
  if (!partial || body.tag !== undefined) {
    input.tag = tags.has(body.tag) ? body.tag : 'Important'
  }
  if (!partial || body.repeat !== undefined) {
    input.repeat = repeats.has(body.repeat) ? body.repeat : 'None'
  }
  if (!partial || body.notes !== undefined) input.notes = String(body.notes || '').trim().slice(0, 1000)
  if (!partial || body.done !== undefined) input.done = Boolean(body.done)
  if (!partial || body.telegram_enabled !== undefined) input.telegram_enabled = body.telegram_enabled !== false
  return input
}

function handleError(res, error) {
  console.error(error)
  return res.status(500).json({ error: 'The reminder service could not complete that request.' })
}

function zonedWallClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: notificationTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = Number(part.value)
    return result
  }, {})

  return {
    ...parts,
    wallMillis: Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second),
  }
}

function reminderWallMillis(reminder) {
  const [year, month, day] = reminder.date.split('-').map(Number)
  const [hour, minute] = String(reminder.time || '').slice(0, 5).split(':').map(Number)
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null
  return Date.UTC(year, month - 1, day, hour, minute)
}

function telegramConfigured() {
  return Boolean(telegramBotToken && telegramChatId)
}

async function sendTelegramMessage(text) {
  const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramChatId, text }),
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok || !result.ok) throw new Error(result.description || `Telegram returned ${response.status}.`)
}

async function runNotificationTick() {
  if (!telegramConfigured()) return { configured: false, checked: 0, sent: 0 }

  const { data, error } = await supabase
    .from('reminders')
    .select('id, title, date, time, notes, done, telegram_enabled, telegram_last_notified_at')
    .eq('done', false)
    .eq('telegram_enabled', true)
    .not('time', 'is', null)

  if (error) throw error

  const now = zonedWallClock()
  const leadMillis = notificationLeadMinutes * 60 * 1000
  const intervalMillis = notificationIntervalMinutes * 60 * 1000
  let sent = 0

  for (const reminder of data || []) {
    const dueMillis = reminderWallMillis(reminder)
    if (dueMillis === null || now.wallMillis < dueMillis - leadMillis || now.wallMillis >= dueMillis) continue

    const lastSent = reminder.telegram_last_notified_at ? Date.parse(reminder.telegram_last_notified_at) : NaN
    if (Number.isFinite(lastSent) && Date.now() - lastSent < intervalMillis) continue

    const dueTime = String(reminder.time).slice(0, 5)
    const message = [
      'Reminder approaching',
      `${reminder.title}`,
      `Due ${reminder.date} at ${dueTime} (${notificationTimezone})`,
      reminder.notes ? reminder.notes : null,
    ].filter(Boolean).join('\n')

    try {
      await sendTelegramMessage(message)
      const { error: updateError } = await supabase
        .from('reminders')
        .update({ telegram_last_notified_at: new Date().toISOString() })
        .eq('id', reminder.id)
        .eq('done', false)
      if (updateError) throw updateError
      sent += 1
    } catch (sendError) {
      console.error(`Notification failed for reminder ${reminder.id}.`, sendError)
    }
  }

  return { configured: true, checked: data?.length || 0, sent }
}

app.get('/health', (_req, res) => res.json({
  ok: true,
  service: 'date-reminder-api',
  telegramConfigured: telegramConfigured(),
  notificationLeadMinutes,
  notificationIntervalMinutes,
  notificationTimezone,
}))

app.get('/api/reminders', workspaceId, async (req, res) => {
  let query = supabase
    .from('reminders')
    .select('*')
    .eq('workspace_id', req.workspaceId)
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: false })

  if (req.query.status === 'completed') query = query.eq('done', true)
  if (req.query.status === 'upcoming') query = query.eq('done', false)

  const { data, error } = await query
  if (error) return handleError(res, error)
  return res.json({ data })
})

app.post('/api/reminders', workspaceId, async (req, res) => {
  try {
    const input = reminderInput(req.body)
    const { data, error } = await supabase
      .from('reminders')
      .insert({ ...input, workspace_id: req.workspaceId })
      .select('*')
      .single()
    if (error) return handleError(res, error)
    return res.status(201).json({ data })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.patch('/api/reminders/:id', workspaceId, async (req, res) => {
  try {
    const input = reminderInput(req.body, true)
    const { data, error } = await supabase
      .from('reminders')
      .update({ ...input, telegram_last_notified_at: null })
      .eq('id', req.params.id)
      .eq('workspace_id', req.workspaceId)
      .select('*')
      .single()
    if (error) return handleError(res, error)
    return res.json({ data })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
})

app.delete('/api/reminders/:id', workspaceId, async (req, res) => {
  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', req.params.id)
    .eq('workspace_id', req.workspaceId)
  if (error) return handleError(res, error)
  return res.status(204).end()
})

app.post('/api/notifications/tick', async (req, res) => {
  if (!notificationCronSecret || req.header('x-notification-cron-secret') !== notificationCronSecret) {
    return res.status(401).json({ error: 'Notification scheduler authentication failed.' })
  }

  try {
    return res.json(await runNotificationTick())
  } catch (error) {
    return handleError(res, error)
  }
})

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(port, () => console.log(`Date reminder API listening on port ${port}`))

if (telegramConfigured()) {
  setTimeout(() => runNotificationTick().catch((error) => console.error('Notification scheduler failed.', error)), 5000)
  setInterval(() => runNotificationTick().catch((error) => console.error('Notification scheduler failed.', error)), 60 * 1000)
} else {
  console.log('Telegram notifications are disabled until TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are configured.')
}
