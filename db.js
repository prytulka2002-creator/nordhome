import pg from 'pg'
import { persistentEnvPath, projectEnvPath } from './config.js'

const { Pool } = pg
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error(`DATABASE_URL не налаштований. Перевірено: ${projectEnvPath} та ${persistentEnvPath}`)
}

const isLocal = /localhost|127\.0\.0\.1/.test(connectionString)
export const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

export async function query(text, params = []) {
  return pool.query(text, params)
}

export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
