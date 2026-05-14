const { prepare } = require('../db');

async function up() {
  try {
    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP DEFAULT NOW();
    `).run();

    console.log('Migration completed: ensured confirmed_at column on users table');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

module.exports = { up };
