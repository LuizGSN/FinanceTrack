const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

async function initializeDb() {
  await pool.connect().then((c) => { c.release(); });
}

async function query(sql, params = []) {
  const result = await pool.query(sql, params);
  return result.rows;
}

function prepare(sql) {
  return {
    run: async (...params) => {
      const query = /insert/i.test(sql) && !/returning/i.test(sql)
        ? sql + ' RETURNING id'
        : sql;
      const result = await pool.query(query, params);
      const row = result.rows[0];
      return {
        lastInsertRowid: row?.id || null,
        changes: result.rowCount,
      };
    },
    all: async (...params) => {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    get: async (...params) => {
      const result = await pool.query(sql, params);
      return result.rows[0] || undefined;
    },
  };
}

// No-op — PostgreSQL persiste direto
function saveDb() {}

module.exports = { initializeDb, query, prepare, saveDb };
