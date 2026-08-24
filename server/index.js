import express from 'express'
import rateLimit from 'express-rate-limit'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import { pool } from './db.js'

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(rootDir))

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateSubmission(body)
{
  const name = (body.name || '').trim()
  const email = (body.email || '').trim()
  const subject = (body.subject || '').trim()
  const message = (body.message || '').trim()

  if (name.length < 2) return { error: 'Please enter your name (2+ characters).' }
  if (!EMAIL_RE.test(email)) return { error: 'Please enter a valid email.' }
  if (subject.length < 3) return { error: 'Please enter a subject.' }
  if (message.length < 10) return { error: 'Message should be at least 10 characters.' }

  return { value: { name, email, subject, message } }
}

const contactLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 1,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Please wait a minute before sending another message.' },
})

app.post('/api/contact', contactLimiter, async (req, res) =>
{
  // Honeypot: real visitors never see or fill this field. If it has a
  // value, the submission came from a bot — pretend it worked and stop.
  if ((req.body.company || '').trim() !== '')
  {
    return res.json({ ok: true })
  }

  const { error, value } = validateSubmission(req.body)
  if (error)
  {
    return res.status(400).json({ error })
  }

  try
  {
    await pool.query(
      'INSERT INTO contact_submissions (name, email, subject, message) VALUES ($1, $2, $3, $4)',
      [value.name, value.email, value.subject, value.message]
    )
    res.json({ ok: true })
  }
  catch (err)
  {
    console.error('Failed to store contact submission:', err)
    res.status(500).json({ error: 'Something went wrong. Please try again or email us directly.' })
  }
})

app.get('/api/contact', async (req, res) =>
{
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN)
  {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try
  {
    const { rows } = await pool.query(
      'SELECT id, name, email, subject, message, created_at FROM contact_submissions ORDER BY created_at DESC LIMIT 200'
    )
    res.json({ submissions: rows })
  }
  catch (err)
  {
    console.error('Failed to fetch contact submissions:', err)
    res.status(500).json({ error: 'Something went wrong.' })
  }
})

app.listen(PORT, () =>
{
  console.log(`Nova server listening on http://localhost:${PORT}`)
})
