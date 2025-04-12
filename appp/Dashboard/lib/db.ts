// Database connection and schema setup for PostgreSQL

import { Pool } from 'pg'

// Database connection configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'dxtrade',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
})

// Initialize database and create tables if they don't exist
export async function initDatabase() {
  const client = await pool.connect()
  try {
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create user_preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        preferred_markets JSONB,
        favorite_stocks JSONB,
        notifications JSONB,
        trading_preferences JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
  } finally {
    client.release()
  }
}

// User related database operations
export const userDb = {
  // Create or update user profile
  async saveUserProfile(userData: any) {
    const client = await pool.connect()
    try {
      // Start transaction
      await client.query('BEGIN')

      // Check if user exists
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      )

      let userId

      if (userResult.rows.length === 0) {
        // Create new user
        const newUserResult = await client.query(
          'INSERT INTO users (name, email, phone, bio) VALUES ($1, $2, $3, $4) RETURNING id',
          [userData.name, userData.email, userData.phone, userData.bio]
        )
        userId = newUserResult.rows[0].id
      } else {
        // Update existing user
        userId = userResult.rows[0].id
        await client.query(
          'UPDATE users SET name = $1, phone = $2, bio = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
          [userData.name, userData.phone, userData.bio, userId]
        )

        // Delete existing preferences to replace them
        await client.query('DELETE FROM user_preferences WHERE user_id = $1', [userId])
      }

      // Save user preferences
      await client.query(
        `INSERT INTO user_preferences 
        (user_id, preferred_markets, favorite_stocks, notifications, trading_preferences) 
        VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          JSON.stringify(userData.preferredMarkets || []),
          JSON.stringify(userData.favoriteStocks || []),
          JSON.stringify(userData.notifications || {}),
          JSON.stringify(userData.tradingPreferences || {}),
        ]
      )

      // Commit transaction
      await client.query('COMMIT')
      return { success: true, userId }
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK')
      console.error('Error saving user profile:', error)
      return { success: false, error }
    } finally {
      client.release()
    }
  },

  // Get user profile by email
  async getUserProfile(email: string) {
    const client = await pool.connect()
    try {
      // Get user data
      const userResult = await client.query(
        'SELECT id, name, email, phone, bio FROM users WHERE email = $1',
        [email]
      )

      if (userResult.rows.length === 0) {
        return null
      }

      const user = userResult.rows[0]

      // Get user preferences
      const prefsResult = await client.query(
        'SELECT preferred_markets, favorite_stocks, notifications, trading_preferences FROM user_preferences WHERE user_id = $1',
        [user.id]
      )

      let preferences = {}
      if (prefsResult.rows.length > 0) {
        const prefs = prefsResult.rows[0]
        preferences = {
          preferredMarkets: prefs.preferred_markets,
          favoriteStocks: prefs.favorite_stocks,
          notifications: prefs.notifications,
          tradingPreferences: prefs.trading_preferences,
        }
      }

      return {
        ...user,
        ...preferences,
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    } finally {
      client.release()
    }
  },
}

export default pool