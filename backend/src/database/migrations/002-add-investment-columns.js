const { prepare } = require('../db');

async function up() {
  try {
    // Adicionar colunas de investimento se não existirem
    const columnsToAdd = [
      { name: 'exchange', type: 'TEXT' },
      { name: 'share_price', type: 'NUMERIC' },
      { name: 'current_share_price', type: 'NUMERIC' },
      { name: 'shares_count', type: 'NUMERIC' },
      { name: 'purchase_date', type: 'DATE' },
      { name: 'purchase_time', type: 'TIME' },
      { name: 'notes', type: 'TEXT' },
    ];

    for (const column of columnsToAdd) {
      try {
        await prepare(`
          ALTER TABLE investments ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};
        `).run();
        console.log(`Added column: ${column.name}`);
      } catch (err) {
        // Column might already exist, continue
        console.log(`Column ${column.name} already exists or error: ${err.message}`);
      }
    }

    console.log('Migration completed: added investment columns to investments table');
  } catch (err) {
    console.error('Migration error:', err);
    throw err;
  }
}

module.exports = { up };
