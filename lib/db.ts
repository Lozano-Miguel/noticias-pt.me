import postgres from 'postgres'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

const sql = postgres(DATABASE_URL)

export default sql
