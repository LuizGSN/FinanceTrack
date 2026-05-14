const { prepare } = require('../db');

async function up() {
  try {
    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
    `).run();

    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMP;
    `).run();

    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `).run();
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

module.exports = { up };
