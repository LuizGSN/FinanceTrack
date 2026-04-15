const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');

    // Verificar se a pasta de migrations existe
    if (!fs.existsSync(migrationsDir)) {
      logger.info('No migrations directory found');
      return;
    }

    // Ler todos os arquivos .js da pasta de migrations
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();

    logger.info(`Found ${files.length} migration files`);

    // Executar cada migration
    for (const file of files) {
      try {
        const migration = require(path.join(migrationsDir, file));
        logger.info(`Running migration: ${file}`);
        await migration.up();
        logger.info(`Completed migration: ${file}`);
      } catch (err) {
        logger.error(`Error running migration ${file}:`, err);
        // Continue with next migration even if one fails
      }
    }

    logger.info('All migrations completed');
  } catch (err) {
    logger.error('Migration runner error:', err);
  }
}

module.exports = { runMigrations };
