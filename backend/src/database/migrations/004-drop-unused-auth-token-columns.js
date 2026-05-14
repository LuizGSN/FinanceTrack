const { prepare } = require('../db');

async function up() {
  try {
    await prepare(`
      ALTER TABLE users DROP COLUMN IF EXISTS confirmation_token;
    `).run();

    await prepare(`
      ALTER TABLE users DROP COLUMN IF EXISTS confirmation_expires;
    `).run();

    await prepare(`
      ALTER TABLE users DROP COLUMN IF EXISTS reset_token;
    `).run();

    await prepare(`
      ALTER TABLE users DROP COLUMN IF EXISTS reset_expires;
    `).run();
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

module.exports = { up };
