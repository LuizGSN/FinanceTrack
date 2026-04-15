const { prepare } = require('../db');

async function up() {
  try {
    // Adicionar colunas de confirmação de email se não existirem
    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
    `).run();

    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires TIMESTAMP;
    `).run();

    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP DEFAULT NOW();
    `).run();

    // Adicionar colunas de reset de senha se não existirem
    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
    `).run();

    await prepare(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
    `).run();

    console.log('Migration completed: added confirmation and reset columns to users table');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

module.exports = { up };
