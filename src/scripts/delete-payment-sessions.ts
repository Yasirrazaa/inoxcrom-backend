import { Client } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const deletePaymentSessions = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    
    // First, let's check what tables we have
    const tablesQuery = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
    
    console.log('Available tables:', tablesQuery.rows.map(r => r.table_name))

    // Delete payment sessions for carts
    await client.query(`
      -- Delete payment sessions
      DELETE FROM payment_session
      WHERE id IS NOT NULL
      AND status != 'authorized';

      -- Delete payment providers that are no longer referenced
      DELETE FROM payment_provider
      WHERE id NOT IN (
        SELECT DISTINCT provider_id 
        FROM payment_session
      );
    `)

    console.log('Successfully deleted payment sessions')
  } catch (error) {
    console.error('Error deleting payment sessions:', error)
    throw error
  } finally {
    await client.end()
  }
}

// Execute the function
deletePaymentSessions().catch(console.error)