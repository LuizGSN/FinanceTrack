// Exemplos de testando as novas validações

// Import validators
const validators = require('./backend/src/utils/validators');

// ============= Exemplos de Validações Funcionando =============

// 1. Validação de Email
console.log('=== EMAIL VALIDATION ===');
console.log(validators.validateEmail('user@example.com'));  // true
console.log(validators.validateEmail('invalid.email'));     // false

// 2. Validação de Senha
console.log('\n=== PASSWORD VALIDATION ===');
console.log(validators.validatePassword('secure123'));      // true
console.log(validators.validatePassword('short'));          // false

// 3. Validação de Transação Completa
console.log('\n=== TRANSACTION VALIDATION ===');
const transaction1 = {
  description: 'Salário janeiro',
  amount: 3000.50,
  type: 'income',
  category: 'salary',
  date: '2024-01-15'
};
console.log(validators.validateTransaction(transaction1));
// Output:
// {
//   isValid: true,
//   errors: {}
// }

// 4. Transação com erros
console.log('\n=== INVALID TRANSACTION ===');
const transaction2 = {
  description: 'x',                    // Muito curta
  amount: -100,                        // Negativa
  type: 'invalid_type',                // Tipo inválido
  category: 'food',                    // Categoria não existe para income
  date: '2099-12-31'                   // Data no futuro
};
console.log(validators.validateTransaction(transaction2));
// Output:
// {
//   isValid: false,
//   errors: {
//     description: 'Description must be between 3 and 255 characters',
//     amount: 'Amount must be a positive number up to 999999.99',
//     type: 'Type must be one of: income, expense',
//     category: 'Category must be one of: salary, freelance, investment, bonus, other_income',
//     date: 'Date must be valid and not in the future'
//   }
// }

// 5. Categorias Permitidas
console.log('\n=== ALLOWED CATEGORIES ===');
console.log('Income categories:', validators.ALLOWED_CATEGORIES.income);
// ['salary', 'freelance', 'investment', 'bonus', 'other_income']
console.log('Expense categories:', validators.ALLOWED_CATEGORIES.expense);
// ['food', 'transport', 'utilities', 'entertainment', 'healthcare', 'shopping', 'education', 'other_expense']

// ============= Exemplos de Toast Notifications =============

// No React/Frontend:
import Toast from './frontend/src/utils/Toast';

// Notificação de sucesso
Toast.success('Transação criada com sucesso!');

// Notificação de erro
Toast.error('Erro ao processar a transação', 5000);

// Notificação de aviso
Toast.warning('Gasto elevado detectado!');

// Notificação de informação
Toast.info('Nova atualização disponível');

// ============= Exemplos Hook useFetch =============

// No React/Frontend:
import { useFetch } from './frontend/src/hooks/useFetch';

const MyComponent = () => {
  const { loading, error, execute } = useFetch();

  const handleSubmit = async (data) => {
    try {
      const result = await execute(
        'http://localhost:3000/api/v1/transactions',
        {
          method: 'POST',
          body: JSON.stringify(data),
          successMessage: 'Transação criada!'
        }
      );
      console.log('Success:', result);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <button disabled={loading} onClick={() => handleSubmit({...})}>
      {loading ? 'Processando...' : 'Salvar'}
    </button>
  );
};

// ============= Rate Limiting em Ação =============

// O rate limiting é automático no backend, mas você verá erros como:

// Erro 429 (Too Many Requests) para autenticação:
// {
//   "error": "Too many authentication attempts. Try again in 15 minutes."
// }

// Erro 429 para transações:
// {
//   "error": "Too many transaction requests. Please wait before making more requests."
// }

// ============= Swagger/API Docs =============

// Após iniciar o backend (npm run dev):
// Acesse: http://localhost:3000/api/docs

// Você verá:
// - Todos os endpoints documentados
// - Modelos de requisição/resposta
// - Botão "Try it out" para testar diretamente
// - Autenticação Bearer JWT

// ============= Logs Estruturados =============

// Os logs aparecem em:
// - backend/logs/all.log (todos os eventos)
// - backend/logs/error.log (apenas erros)

// Exemplos de o que é logado:
// [2024-04-14 10:30:45] info: Database initialized
// [2024-04-14 10:30:46] http: POST /api/v1/auth/login - 200 (15ms)
// [2024-04-14 10:30:47] warn: Too many login attempts
// [2024-04-14 10:30:48] error: Database connection failed

// ============= Executar Testes =============

// Backend:
// npm test                  # Executa uma vez
// npm run test:watch       # Modo watch

// Frontend:
// npm test                 # Executa uma vez
// npm run test:ui          # Interface visual
// npm run coverage         # Cobertura de testes
