const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const demoUser = {
  name: process.env.DEMO_USER_NAME || 'Usuario Demo',
  email: process.env.DEMO_USER_EMAIL || 'demo@financetrack.app',
  password: process.env.DEMO_USER_PASSWORD || 'demo123456',
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

const demoTransactions = [
  ['Salario', 5200, 'income', 'Salario', '2026-05-01'],
  ['Projeto freelance', 1400, 'income', 'Freelance', '2026-05-08'],
  ['Aluguel', 1650, 'expense', 'Moradia', '2026-05-05'],
  ['Mercado', 680, 'expense', 'Alimentacao', '2026-05-10'],
  ['Internet', 120, 'expense', 'Servicos', '2026-05-12'],
  ['Academia', 99, 'expense', 'Saude', '2026-05-13'],
];

const demoInvestments = [
  ['Tesouro Selic', 'bond', 'Tesouro Direto', 2500, 2620, null, null, null, '2026-03-12', null, 'Reserva de oportunidade'],
  ['ETF IVVB11', 'etf', 'B3', 1800, 1935, 330, 354.75, 5.45, '2026-04-03', null, 'Exposicao internacional'],
  ['Bitcoin', 'crypto', 'Binance', 900, 1025, 430000, 489000, 0.00209, '2026-04-20', null, 'Posicao pequena para diversificacao'],
];

async function resetDemoData() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL nao encontrado. Configure o .env antes de executar.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('TRUNCATE TABLE investments, transactions, users RESTART IDENTITY CASCADE');

    const passwordHash = await bcrypt.hash(demoUser.password, 12);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, confirmed_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email`,
      [demoUser.name, demoUser.email, passwordHash]
    );
    const userId = userResult.rows[0].id;

    for (const transaction of demoTransactions) {
      await client.query(
        `INSERT INTO transactions (user_id, description, amount, type, category, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, ...transaction]
      );
    }

    for (const investment of demoInvestments) {
      await client.query(
        `INSERT INTO investments (
          user_id, name, type, exchange, initial_amount, current_value,
          share_price, current_share_price, shares_count, purchase_date,
          purchase_time, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [userId, ...investment]
      );
    }

    await client.query('COMMIT');

    console.log('Dados apagados e conta demo criada com sucesso.');
    console.log(`Email demo: ${demoUser.email}`);
    console.log(`Senha demo: ${demoUser.password}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

resetDemoData().catch((error) => {
  console.error('Falha ao resetar dados demo:', error.message);
  process.exit(1);
});
