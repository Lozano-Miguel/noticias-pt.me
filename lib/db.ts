import postgres from 'postgres'

// Shared PostgreSQL connection; this replaces the Supabase client.
const sql = postgres(process.env.DATABASE_URL as string)

export default sql
