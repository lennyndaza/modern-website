import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from './db.js'

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations')

async function run()
{
  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files)
  {
    console.log(`Applying ${file}...`)
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    await pool.query(sql)
  }

  console.log('Migrations complete.')
  await pool.end()
}

run().catch((err) =>
{
  console.error('Migration failed:', err)
  process.exit(1)
})
