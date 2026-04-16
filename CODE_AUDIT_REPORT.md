# Code Audit Report (FinanceTrack)

Data da análise: 2026-04-15

## Principais falhas encontradas

### 1) Bypass de confirmação de e-mail (crítico)
- A coluna `confirmed_at` é criada com `DEFAULT CURRENT_TIMESTAMP`/`DEFAULT NOW()`.
- No cadastro, o usuário é inserido sem definir `confirmed_at` como `NULL`.
- No login, o bloqueio depende de `if (!user.confirmed_at)`.

**Impacto:** contas novas já nascem “confirmadas”, anulando o fluxo de verificação de e-mail.

### 2) Rotas legadas sem rate limit (alto)
- O rate limiting está aplicado em `/api/v1/auth` e `/api/v1/transactions`.
- As rotas de compatibilidade `/auth` e `/transactions` continuam ativas sem os mesmos limiters.

**Impacto:** um atacante pode contornar proteção anti-brute-force e anti-abuso usando os endpoints legados.

### 3) Resposta incorreta em create/update de investimentos (alto)
- `prepare(...).run()` retorna metadados (`lastInsertRowid`, `changes`), não o registro completo.
- Mesmo usando `RETURNING *` no SQL, o wrapper ignora as colunas retornadas.
- Os endpoints retornam esse objeto de metadados para o frontend.

**Impacto:** inconsistência de API, quebra de integração no frontend e dificuldade de auditoria dos dados gravados.

### 4) Inconsistência entre schema e validação de tipos de investimento (médio)
- Banco aceita `etf`, `option`, `future` no `CHECK`.
- Validador aceita apenas `stock`, `crypto`, `bond`, `real_state`, `fund`, `other`.

**Impacto:** tipos válidos no banco são rejeitados pela aplicação, gerando erros funcionais.

### 5) Segredo JWT não validado na inicialização (médio)
- Não há falha explícita caso `JWT_SECRET` esteja ausente.
- `jwt.sign`/`jwt.verify` são usados diretamente com `process.env.JWT_SECRET`.

**Impacto:** risco de configuração insegura em produção e comportamento inesperado em autenticação.

### 6) Token armazenado em `localStorage` (médio)
- O frontend salva e lê token do `localStorage`.

**Impacto:** em caso de XSS, sessão pode ser exfiltrada; recomendável cookie `HttpOnly` + `Secure` + `SameSite`.

## Recomendações objetivas

1. **Confirmação de e-mail:**
   - Tornar `confirmed_at` padrão `NULL`.
   - Backfill para usuários pendentes (se aplicável) e ajuste de migration.
2. **Rate limit unificado:**
   - Aplicar os mesmos limiters em `/auth` e `/transactions`, ou remover rotas legadas.
3. **Investimentos create/update:**
   - Ajustar wrapper `prepare.run()` para devolver `rows[0]` quando houver `RETURNING *`, ou fazer `SELECT` após `INSERT/UPDATE`.
4. **Tipos de investimento:**
   - Centralizar enum em uma única fonte de verdade (schema + validador + swagger).
5. **Hard fail de segurança no boot:**
   - Encerrar app no startup se `JWT_SECRET` estiver vazio.
6. **Sessão no frontend:**
   - Migrar para cookie HttpOnly e reforçar CSP/escaping para reduzir risco de XSS.
