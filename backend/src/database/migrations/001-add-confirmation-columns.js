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
      ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
    `).run();

    // Garantir que novos registros não sejam confirmados automaticamente
    await prepare(`
      ALTER TABLE users ALTER COLUMN confirmed_at DROP DEFAULT;
    `).run();

    // Corrigir usuários pendentes que eventualmente tenham nascido confirmados por padrão
    await prepare(`
      UPDATE users
      SET confirmed_at = NULL
      WHERE confirmation_token IS NOT NULL;
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
