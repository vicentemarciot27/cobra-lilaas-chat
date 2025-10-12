# Guia de Migração de Dados

Este guia explica como migrar os dados padrão do código para o Supabase.

## Métodos de Migração

Existem duas formas de popular o banco de dados Supabase com dados iniciais:

### Método 1: Usando SQL Seed Script (Recomendado para desenvolvimento)

1. Abra o SQL Editor no painel do Supabase
2. Copie o conteúdo do arquivo `seed.sql`
3. Cole no editor e execute
4. Verifique o resumo de registros inseridos

**Vantagens:**
- Mais rápido
- Não depende da aplicação estar rodando
- Ideal para testes e desenvolvimento

### Método 2: Usando o Utilitário JavaScript

1. Certifique-se de que a aplicação está rodando (`npm run dev`)
2. Abra o Console do Navegador (F12)
3. Execute:
   ```javascript
   // Importar a função (já disponível globalmente)
   await migrateDefaultsToSupabase()
   ```
4. Aguarde a conclusão e verifique o resumo

**Vantagens:**
- Mantém sincronização com os dados defaults do código
- Útil para atualizar dados após mudanças no código
- Pode ser executado sempre que necessário

## Estrutura dos Dados Defaults

Os dados padrão estão definidos em `src/data/defaults.js` e incluem:

- **Devedores**: Exemplos de perfis (bom pagador, inadimplente, novo)
- **Parcelas**: Diferentes status (pago, vencido, futuro, renegociado)
- **Conversas**: Histórico de interações
- **Mensagens**: Diálogos completos
- **Conhecimento**: Insights extraídos automaticamente
- **Promessas**: Compromissos de pagamento
- **Réguas**: Configurações de workflow

## Verificação de Dados

Após a migração, você pode verificar os dados usando queries SQL:

```sql
-- Verificar contagem de registros
SELECT 
    'debtors' as table_name, COUNT(*) as count FROM debtors
UNION ALL
SELECT 'installments', COUNT(*) FROM installments
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'knowledge_entries', COUNT(*) FROM knowledge_entries
UNION ALL
SELECT 'promises_to_pay', COUNT(*) FROM promises_to_pay
UNION ALL
SELECT 'rulers', COUNT(*) FROM rulers;

-- Verificar alguns registros
SELECT * FROM debtors LIMIT 5;
SELECT * FROM installments ORDER BY due_date DESC LIMIT 10;
SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 5;
```

## Limpeza de Dados

Se você precisar limpar todos os dados e recomeçar:

```sql
-- ATENÇÃO: Isso irá deletar TODOS os dados!
TRUNCATE TABLE 
  messages, 
  knowledge_entries, 
  promises_to_pay, 
  conversations, 
  installments, 
  debtors, 
  rulers 
CASCADE;
```

## Troubleshooting

### Erro: "duplicate key value violates unique constraint"

Isso acontece quando você tenta inserir dados que já existem. Soluções:

1. Limpe os dados primeiro (veja seção acima)
2. Ou use `upsert` ao invés de `insert` no script de migração

### Erro: "foreign key constraint violation"

Os dados devem ser inseridos na ordem correta devido às relações:

1. `debtors` (primeiro)
2. `installments`, `conversations`, `rulers` (dependem de debtors)
3. `messages` (dependem de conversations)
4. `knowledge_entries`, `promises_to_pay` (dependem de debtors e outras tabelas)

### Dados não aparecem na aplicação

1. Verifique se os dados estão realmente no Supabase (use SQL Editor)
2. Force um refresh na aplicação (Ctrl+Shift+R)
3. Verifique o console do navegador para erros
4. Verifique as políticas RLS do Supabase

## Manutenção

Para manter os dados sincronizados entre o código e o Supabase:

1. Sempre que alterar `defaults.js`, documente as mudanças
2. Execute o script de migração novamente ou atualize manualmente no Supabase
3. Considere criar um script de CI/CD para automatizar isso

