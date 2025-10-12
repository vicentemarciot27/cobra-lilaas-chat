# Configuração do Supabase

Este projeto usa Supabase como banco de dados para gerenciar dados de devedores, parcelas, conversas, conhecimento e configurações de workflow.

## Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Um projeto criado no Supabase

## Configuração

### 1. Criar o projeto no Supabase

1. Acesse https://app.supabase.com
2. Crie um novo projeto
3. Anote a URL do projeto e a chave anônima (anon key)

### 2. Executar o script SQL

1. No painel do Supabase, vá para "SQL Editor"
2. Copie o conteúdo do arquivo `schema.sql`
3. Cole no editor e execute o script
4. Verifique se todas as tabelas foram criadas com sucesso

### 3. Configurar variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

### 4. Reiniciar o servidor de desenvolvimento

```bash
npm run dev
```

## Estrutura do Banco de Dados

### Tabelas

- **debtors**: Dados dos devedores (nome, CPF, telefone, email, etc.)
- **installments**: Parcelas de pagamento
- **conversations**: Conversas com devedores
- **messages**: Mensagens individuais dentro das conversas
- **knowledge_entries**: Entradas de conhecimento extraídas das conversas
- **promises_to_pay**: Promessas de pagamento feitas pelos devedores
- **rulers**: Configurações de workflow e regras de negócio

### Tipos Enumerados

- **debtor_profile**: good_payer, bad_payer, new
- **installment_status**: paid, renegotiated, overdue, future
- **knowledge_category**: behavior, communication, financial, payment
- **knowledge_status**: approved, pending, rejected
- **knowledge_source**: manual, ai
- **message_role**: agent, user
- **agent_tone**: friendly, neutral, formal, firm

## Segurança

O projeto está configurado com Row Level Security (RLS) habilitado em todas as tabelas. As políticas atuais permitem todas as operações para usuários autenticados. Você pode personalizar essas políticas de acordo com suas necessidades de segurança.

## Migrações

Para adicionar novas tabelas ou modificar a estrutura:

1. Crie um novo arquivo SQL na pasta `supabase/migrations/`
2. Execute o script no SQL Editor do Supabase
3. Atualize os tipos TypeScript em `src/lib/database.types.ts`

## Sincronização de Dados

O DataContext automaticamente:
- Carrega dados do Supabase na inicialização
- Mantém uma cópia local em estado React
- Sincroniza alterações de volta para o Supabase
- Mantém dados padrão como fallback em caso de erro

## Troubleshooting

### Erro: "Missing Supabase environment variables"

Verifique se o arquivo `.env` existe e contém as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

### Erro ao conectar com Supabase

1. Verifique se as credenciais estão corretas
2. Certifique-se de que o projeto Supabase está ativo
3. Verifique a conexão com a internet

### Dados não aparecem

1. Verifique se o script SQL foi executado completamente
2. Verifique o console do navegador para erros
3. Verifique se as políticas RLS estão configuradas corretamente

