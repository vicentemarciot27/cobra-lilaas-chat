# 🗄️ Integração Supabase - Cobra LiLaas Chat

Este documento descreve a integração completa do Supabase com o projeto Cobra LiLaas Chat.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Setup Inicial](#setup-inicial)
4. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
5. [Migração de Dados](#migração-de-dados)
6. [Uso na Aplicação](#uso-na-aplicação)
7. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

A integração com Supabase substitui o armazenamento local de dados por um banco de dados PostgreSQL real, mantendo a interface do `DataContext` compatível com o código existente.

### Principais Características

- ✅ **Sincronização automática** com Supabase
- ✅ **Fallback para dados locais** em caso de erro
- ✅ **Type-safe** com TypeScript
- ✅ **Real-time ready** (preparado para futuras features)
- ✅ **Row Level Security (RLS)** habilitado
- ✅ **Migrações SQL** versionadas

## 📁 Estrutura de Arquivos

```
cobra-lilaas-chat/
├── supabase/
│   ├── schema.sql          # Schema completo do banco
│   ├── seed.sql            # Dados de exemplo para testes
│   ├── README.md           # Documentação do Supabase
│   ├── MIGRATION.md        # Guia de migração de dados
│   └── .env.example        # Template de variáveis de ambiente
├── src/
│   ├── lib/
│   │   ├── supabase.ts              # Cliente Supabase configurado
│   │   ├── database.types.ts        # Tipos TypeScript gerados
│   │   └── migrate-to-supabase.ts   # Utilitário de migração
│   ├── hooks/
│   │   └── use-supabase-sync.ts     # Hook para operações CRUD
│   ├── contexts/
│   │   └── DataContext.tsx          # Context atualizado (async)
│   └── components/
│       └── DataLoadingWrapper.tsx   # Componente de loading/error
└── .env                              # Suas credenciais (não commitado)
```

## 🚀 Setup Inicial

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Crie um novo projeto
3. Aguarde o provisionamento (pode levar alguns minutos)
4. Acesse **Settings** → **API**
5. Copie:
   - **Project URL** (formato: `https://xxx.supabase.co`)
   - **anon/public key**

### 2. Configurar Variáveis de Ambiente

```bash
# No diretório raiz do projeto
cp supabase/.env.example .env
```

Edite o arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

### 3. Executar o Schema SQL

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie o conteúdo de `supabase/schema.sql`
4. Cole e execute (botão **RUN**)
5. Verifique se não há erros

### 4. Popular com Dados Iniciais

**Opção A: Usando SQL (Recomendado)**

1. No SQL Editor do Supabase
2. Copie o conteúdo de `supabase/seed.sql`
3. Execute

**Opção B: Usando JavaScript**

```javascript
// No console do navegador (F12) com a aplicação rodando
await migrateDefaultsToSupabase()
```

### 5. Iniciar a Aplicação

```bash
npm run dev
```

A aplicação agora está conectada ao Supabase! 🎉

## 🗃️ Estrutura do Banco de Dados

### Tabelas Principais

| Tabela | Descrição | Relações |
|--------|-----------|----------|
| `debtors` | Informações dos devedores | - |
| `installments` | Parcelas de pagamento | → `debtors` |
| `conversations` | Conversas com devedores | → `debtors` |
| `messages` | Mensagens individuais | → `conversations` |
| `knowledge_entries` | Base de conhecimento | → `debtors`, `conversations` |
| `promises_to_pay` | Promessas de pagamento | → `debtors`, `installments` |
| `rulers` | Configurações de workflow | - |

### Tipos Enumerados

```sql
-- Perfis de devedores
debtor_profile: 'good_payer' | 'bad_payer' | 'new'

-- Status de parcelas
installment_status: 'paid' | 'renegotiated' | 'overdue' | 'future'

-- Categorias de conhecimento
knowledge_category: 'behavior' | 'communication' | 'financial' | 'payment'

-- Status de conhecimento
knowledge_status: 'approved' | 'pending' | 'rejected'

-- Fonte do conhecimento
knowledge_source: 'manual' | 'ai'

-- Papel na mensagem
message_role: 'agent' | 'user'

-- Tom do agente
agent_tone: 'friendly' | 'neutral' | 'formal' | 'firm'
```

### Índices

Todos os campos frequentemente consultados possuem índices para melhor performance:
- Foreign keys
- Status fields
- Date fields
- Boolean flags

## 🔄 Migração de Dados

### Arquitetura da Sincronização

```
┌─────────────────┐
│   DataContext   │  ← Estado React (UI)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ useSupabaseSync │  ← Hook de sincronização
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Supabase API   │  ← Banco de dados
└─────────────────┘
```

### Fluxo de Dados

1. **Inicialização**: `DataContext` carrega dados do Supabase
2. **Operações**: Todas as mutações são enviadas ao Supabase
3. **Fallback**: Em caso de erro, usa dados default locais
4. **UI Updates**: Estado React é atualizado após confirmação do Supabase

### Métodos Disponíveis

```typescript
const {
  // Estado
  debtors,
  installments,
  conversations,
  knowledgeEntries,
  promisesToPay,
  rulers,
  isLoading,
  error,
  
  // Ações
  refreshData,
  addDebtor,
  updateDebtor,
  addMessage,
  addKnowledgeEntry,
  updateKnowledgeEntry,
  approveKnowledge,
  rejectKnowledge,
  addPromiseToPay,
  saveWorkflow,
  getWorkflow,
  updateRuler,
  deleteRuler,
  addRuler,
} = useData();
```

**Importante**: Todos os métodos de ação agora retornam `Promise<void>` e devem ser usados com `await` ou `.then()`.

## 💻 Uso na Aplicação

### Exemplo: Adicionar um Devedor

```typescript
import { useData } from '@/contexts/DataContext';

function MyComponent() {
  const { addDebtor } = useData();
  
  const handleAddDebtor = async () => {
    try {
      await addDebtor({
        name: 'João Silva',
        cpf: '123.456.789-00',
        phone: '(11) 98765-4321',
        email: 'joao@email.com',
        apartment: '101',
        profile: 'new',
      });
      
      toast.success('Devedor adicionado!');
    } catch (error) {
      toast.error('Erro ao adicionar devedor');
      console.error(error);
    }
  };
  
  return <button onClick={handleAddDebtor}>Adicionar</button>;
}
```

### Exemplo: Listar Devedores

```typescript
function DebtorsList() {
  const { debtors, isLoading, error } = useData();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {debtors.map(debtor => (
        <li key={debtor.id}>{debtor.name}</li>
      ))}
    </ul>
  );
}
```

### Exemplo: Atualizar Knowledge Entry

```typescript
function ApproveKnowledge({ knowledgeId }: { knowledgeId: string }) {
  const { approveKnowledge } = useData();
  
  const handleApprove = async () => {
    try {
      await approveKnowledge(knowledgeId);
      toast.success('Conhecimento aprovado!');
    } catch (error) {
      toast.error('Erro ao aprovar');
    }
  };
  
  return <button onClick={handleApprove}>Aprovar</button>;
}
```

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"

**Causa**: Arquivo `.env` não existe ou variáveis não estão definidas.

**Solução**:
```bash
# Criar arquivo .env
cp supabase/.env.example .env

# Editar e adicionar credenciais
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Reiniciar dev server
npm run dev
```

### Erro: "row level security policy violation"

**Causa**: Políticas RLS muito restritivas ou autenticação não configurada.

**Solução**: No SQL Editor do Supabase, ajuste as políticas:

```sql
-- Permitir todas as operações sem autenticação (apenas para desenvolvimento!)
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON debtors;

CREATE POLICY "Enable all operations for all users" ON debtors
  FOR ALL USING (true);

-- Repita para todas as tabelas
```

⚠️ **Atenção**: Isso é inseguro! Use apenas em desenvolvimento.

### Dados não sincronizam

1. **Verifique o console do navegador** (F12) para erros
2. **Verifique a aba Network** para ver se as requisições estão sendo feitas
3. **Teste a conexão**:
   ```javascript
   // No console
   const { data, error } = await supabase.from('debtors').select('count');
   console.log(data, error);
   ```
4. **Force um refresh**:
   ```javascript
   const { refreshData } = useData();
   await refreshData();
   ```

### Performance lenta

1. **Verifique os índices**: Execute `EXPLAIN ANALYZE` nas queries lentas
2. **Limite o número de registros**: Use paginação
3. **Otimize as queries**: Selecione apenas os campos necessários

```typescript
// Exemplo de query otimizada
const { data } = await supabase
  .from('debtors')
  .select('id, name, profile')  // Apenas campos necessários
  .limit(100)                    // Paginação
  .order('created_at', { ascending: false });
```

### Erro: "Failed to fetch"

**Causa**: Problemas de rede ou CORS.

**Solução**:
1. Verifique sua conexão com a internet
2. Verifique se a URL do Supabase está correta
3. Verifique as configurações de CORS no Supabase (normalmente já configurado)

## 📚 Documentação Adicional

- [Documentação Completa do Supabase](supabase/README.md)
- [Guia de Migração](supabase/MIGRATION.md)
- [Supabase Docs Oficiais](https://supabase.com/docs)

## 🎯 Próximos Passos

- [ ] Implementar autenticação de usuários
- [ ] Adicionar subscriptions em tempo real
- [ ] Configurar backups automáticos
- [ ] Implementar paginação nas listagens
- [ ] Adicionar cache com React Query
- [ ] Configurar ambientes (dev/staging/prod)

---

**Desenvolvido com ❤️ usando Supabase + React + TypeScript**

