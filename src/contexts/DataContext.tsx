import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Types
export type DebtorProfile = 'good_payer' | 'bad_payer' | 'new';
export type InstallmentStatus = 'paid' | 'renegotiated' | 'overdue' | 'future';
export type KnowledgeCategory = 'behavior' | 'communication' | 'financial' | 'payment';
export type KnowledgeStatus = 'approved' | 'pending' | 'rejected';

export interface Debtor {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  apartment: string;
  profile: DebtorProfile;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  debtor_id: string;
  due_date: string;
  value: number;
  status: InstallmentStatus;
  renegotiated_id?: string;
  created_at: string;
}

export interface Message {
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  tool_used?: string;
  knowledge_extracted?: string;
}

export interface Conversation {
  id: string;
  debtor_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface KnowledgeEntry {
  id: string;
  debtor_id: string;
  conversation_id?: string;
  category: KnowledgeCategory;
  tags: string[];
  title: string;
  content: string;
  confidence_level: number;
  source: 'manual' | 'ai';
  status: KnowledgeStatus;
  created_at: string;
}

export interface PromiseToPay {
  id: string;
  debtor_id: string;
  installment_id: string;
  amount_promised: number;
  promised_datetime: string;
  fulfilled: boolean;
  observation?: string;
  created_at: string;
}

export interface Ruler {
  id: string;
  name: string;
  profile_target: DebtorProfile;
  json_data: object;
  agent_config: object;
  is_active: boolean;
  created_at: string;
}

interface DataContextType {
  debtors: Debtor[];
  installments: Installment[];
  conversations: Conversation[];
  knowledgeEntries: KnowledgeEntry[];
  promisesToPay: PromiseToPay[];
  rulers: Ruler[];
  addDebtor: (debtor: Debtor) => void;
  updateDebtor: (id: string, updates: Partial<Debtor>) => void;
  addMessage: (conversationId: string, message: Message) => void;
  addKnowledgeEntry: (entry: KnowledgeEntry) => void;
  updateKnowledgeEntry: (id: string, updates: Partial<KnowledgeEntry>) => void;
  approveKnowledge: (id: string) => void;
  rejectKnowledge: (id: string) => void;
  addPromiseToPay: (promise: PromiseToPay) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data initialization
const initialDebtors: Debtor[] = [
  {
    id: '1',
    name: 'João Silva',
    cpf: '021.384.332-33',
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    apartment: '101',
    profile: 'good_payer',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-10-10T18:47:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    cpf: '123.456.789-00',
    phone: '(11) 91234-5678',
    email: 'maria.santos@email.com',
    apartment: '203',
    profile: 'bad_payer',
    created_at: '2024-03-20T14:30:00Z',
    updated_at: '2025-09-15T11:22:00Z'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    cpf: '987.654.321-99',
    phone: '(11) 99876-5432',
    email: 'carlos.oliveira@email.com',
    apartment: '305',
    profile: 'new',
    created_at: '2025-09-01T09:00:00Z',
    updated_at: '2025-10-08T16:30:00Z'
  },
  {
    id: '4',
    name: 'Ana Costa',
    cpf: '456.789.123-44',
    phone: '(11) 94567-8901',
    email: 'ana.costa@email.com',
    apartment: '102',
    profile: 'good_payer',
    created_at: '2024-02-10T11:15:00Z',
    updated_at: '2025-10-09T14:20:00Z'
  },
  {
    id: '5',
    name: 'Pedro Ferreira',
    cpf: '321.654.987-55',
    phone: '(11) 93210-9876',
    email: 'pedro.ferreira@email.com',
    apartment: '401',
    profile: 'bad_payer',
    created_at: '2024-05-05T15:45:00Z',
    updated_at: '2025-10-05T09:10:00Z'
  }
];

const initialInstallments: Installment[] = [
  { id: 'i1', debtor_id: '1', due_date: '2025-10-05', value: 750, status: 'overdue', created_at: '2024-01-15T10:00:00Z' },
  { id: 'i2', debtor_id: '1', due_date: '2025-11-05', value: 750, status: 'overdue', created_at: '2024-01-15T10:00:00Z' },
  { id: 'i3', debtor_id: '1', due_date: '2025-12-05', value: 750, status: 'future', created_at: '2024-01-15T10:00:00Z' },
  { id: 'i4', debtor_id: '2', due_date: '2025-06-05', value: 850, status: 'overdue', created_at: '2024-03-20T14:30:00Z' },
  { id: 'i5', debtor_id: '2', due_date: '2025-07-05', value: 850, status: 'overdue', created_at: '2024-03-20T14:30:00Z' },
  { id: 'i6', debtor_id: '2', due_date: '2025-08-05', value: 850, status: 'overdue', created_at: '2024-03-20T14:30:00Z' },
  { id: 'i7', debtor_id: '2', due_date: '2025-09-05', value: 850, status: 'overdue', created_at: '2024-03-20T14:30:00Z' },
  { id: 'i8', debtor_id: '2', due_date: '2025-10-05', value: 850, status: 'overdue', created_at: '2024-03-20T14:30:00Z' },
  { id: 'i9', debtor_id: '3', due_date: '2025-10-01', value: 1200, status: 'overdue', created_at: '2025-09-01T09:00:00Z' },
  { id: 'i10', debtor_id: '3', due_date: '2025-11-01', value: 1200, status: 'future', created_at: '2025-09-01T09:00:00Z' },
  { id: 'i11', debtor_id: '3', due_date: '2025-12-01', value: 1200, status: 'future', created_at: '2025-09-01T09:00:00Z' },
  { id: 'i12', debtor_id: '4', due_date: '2025-10-03', value: 950, status: 'overdue', created_at: '2024-02-10T11:15:00Z' },
  { id: 'i13', debtor_id: '5', due_date: '2025-07-05', value: 1100, status: 'overdue', created_at: '2024-05-05T15:45:00Z' },
  { id: 'i14', debtor_id: '5', due_date: '2025-08-05', value: 1100, status: 'overdue', created_at: '2024-05-05T15:45:00Z' },
  { id: 'i15', debtor_id: '5', due_date: '2025-09-05', value: 1100, status: 'overdue', created_at: '2024-05-05T15:45:00Z' },
];

const initialConversations: Conversation[] = [
  {
    id: 'c1',
    debtor_id: '1',
    messages: [
      { role: 'agent', content: 'Olá João! Aqui é a Lilaas Cobra AI da administradora. Notamos que o pagamento de R$750 venceu em 05/10. Podemos resolver isso juntos?', timestamp: '2025-10-05T14:32:00Z' },
      { role: 'user', content: 'Oi, eu sei... Estou desempregado no momento', timestamp: '2025-10-05T18:47:00Z' },
      { role: 'agent', content: 'Entendo sua situação, João. Que tal parcelarmos em 3x de R$500? Assim fica mais fácil. O que acha?', timestamp: '2025-10-05T18:50:00Z', tool_used: 'Consultou parcelas', knowledge_extracted: 'Desemprego temporário' },
      { role: 'user', content: 'Isso ajudaria muito! Posso pagar a primeira na sexta?', timestamp: '2025-10-05T19:15:00Z' },
      { role: 'agent', content: 'Perfeito! Vou registrar: 3x R$500, primeira parcela 15/10. Te envio o boleto por aqui. Obrigado pela confiança!', timestamp: '2025-10-05T19:17:00Z', tool_used: 'Promessa registrada', knowledge_extracted: 'Prefere parcelamento' }
    ],
    created_at: '2025-10-05T14:32:00Z',
    updated_at: '2025-10-05T19:17:00Z'
  }
];

const initialKnowledgeEntries: KnowledgeEntry[] = [
  {
    id: 'k1',
    debtor_id: '1',
    conversation_id: 'c1',
    category: 'financial',
    tags: ['unemployment', 'temporary'],
    title: 'Situação de Desemprego',
    content: 'Devedor mencionou estar desempregado no momento. Demonstrou boa fé ao explicar situação financeira.',
    confidence_level: 0.85,
    source: 'ai',
    status: 'pending',
    created_at: '2025-10-05T18:50:00Z'
  },
  {
    id: 'k2',
    debtor_id: '1',
    conversation_id: 'c1',
    category: 'payment',
    tags: ['prefers_installments'],
    title: 'Preferência por Parcelamento',
    content: 'Demonstrou interesse e aceitou proposta de parcelamento. Sugere uso de ofertas parceladas em futuras negociações.',
    confidence_level: 0.92,
    source: 'ai',
    status: 'approved',
    created_at: '2025-10-05T19:17:00Z'
  },
  {
    id: 'k3',
    debtor_id: '1',
    category: 'communication',
    tags: ['night_responder'],
    title: 'Responde no Período Noturno',
    content: 'Histórico de respostas mostra maior atividade entre 18:00 e 21:00.',
    confidence_level: 0.78,
    source: 'ai',
    status: 'approved',
    created_at: '2025-10-05T18:00:00Z'
  },
  {
    id: 'k4',
    debtor_id: '2',
    category: 'behavior',
    tags: ['evasive', 'ignores_messages'],
    title: 'Comportamento Evasivo',
    content: 'Histórico de não responder mensagens. Requer abordagem mais assertiva.',
    confidence_level: 0.88,
    source: 'ai',
    status: 'approved',
    created_at: '2025-09-20T10:00:00Z'
  },
  {
    id: 'k5',
    debtor_id: '2',
    category: 'financial',
    tags: ['disputes_amount'],
    title: 'Disputa Valores',
    content: 'Já questionou valores cobrados anteriormente. Necessário enviar comprovantes detalhados.',
    confidence_level: 0.72,
    source: 'ai',
    status: 'pending',
    created_at: '2025-09-25T14:30:00Z'
  },
  {
    id: 'k6',
    debtor_id: '4',
    category: 'behavior',
    tags: ['honest', 'cooperative'],
    title: 'Bom Relacionamento',
    content: 'Sempre demonstra boa fé e vontade de resolver pendências. Manter relacionamento positivo.',
    confidence_level: 0.95,
    source: 'manual',
    status: 'approved',
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'k7',
    debtor_id: '4',
    category: 'payment',
    tags: ['promise_keeper', 'prefers_installments'],
    title: 'Cumpre Promessas',
    content: 'Histórico de cumprimento de 100% das promessas de pagamento feitas.',
    confidence_level: 0.98,
    source: 'manual',
    status: 'approved',
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'k8',
    debtor_id: '5',
    category: 'communication',
    tags: ['no_response', 'phone_off'],
    title: 'Telefone Desligado',
    content: 'Tentativas de contato telefônico não são bem-sucedidas. Priorizar WhatsApp ou SMS.',
    confidence_level: 0.90,
    source: 'ai',
    status: 'approved',
    created_at: '2025-10-03T11:00:00Z'
  },
  {
    id: 'k9',
    debtor_id: '5',
    category: 'behavior',
    tags: ['aggressive', 'threatens_legal'],
    title: 'Comportamento Agressivo',
    content: 'Histórico de respostas agressivas e ameaças de processos. Manter tom profissional e documentar interações.',
    confidence_level: 0.85,
    source: 'ai',
    status: 'approved',
    created_at: '2025-10-03T11:00:00Z'
  }
];

const initialPromisesToPay: PromiseToPay[] = [
  {
    id: 'p1',
    debtor_id: '4',
    installment_id: 'i12',
    amount_promised: 320,
    promised_datetime: '2025-10-15T00:00:00Z',
    fulfilled: false,
    observation: 'Primeira parcela de 3x R$320',
    created_at: '2025-10-09T14:20:00Z'
  }
];

const initialRulers: Ruler[] = [
  {
    id: 'r1',
    name: 'Régua Bom Pagador',
    profile_target: 'good_payer',
    json_data: {},
    agent_config: { personality: 'friendly', tone: 'collaborative' },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'r2',
    name: 'Régua Mau Pagador',
    profile_target: 'bad_payer',
    json_data: {},
    agent_config: { personality: 'firm', tone: 'assertive' },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'r3',
    name: 'Régua Novo Devedor',
    profile_target: 'new',
    json_data: {},
    agent_config: { personality: 'neutral', tone: 'informative' },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(initialKnowledgeEntries);
  const [promisesToPay, setPromisesToPay] = useState<PromiseToPay[]>(initialPromisesToPay);
  const [rulers] = useState<Ruler[]>(initialRulers);

  const addDebtor = (debtor: Debtor) => {
    setDebtors(prev => [...prev, debtor]);
  };

  const updateDebtor = (id: string, updates: Partial<Debtor>) => {
    setDebtors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, messages: [...c.messages, message], updated_at: new Date().toISOString() }
        : c
    ));
  };

  const addKnowledgeEntry = (entry: KnowledgeEntry) => {
    setKnowledgeEntries(prev => [...prev, entry]);
  };

  const updateKnowledgeEntry = (id: string, updates: Partial<KnowledgeEntry>) => {
    setKnowledgeEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const approveKnowledge = (id: string) => {
    updateKnowledgeEntry(id, { status: 'approved' });
  };

  const rejectKnowledge = (id: string) => {
    updateKnowledgeEntry(id, { status: 'rejected' });
  };

  const addPromiseToPay = (promise: PromiseToPay) => {
    setPromisesToPay(prev => [...prev, promise]);
  };

  const value = useMemo(() => ({
    debtors,
    installments,
    conversations,
    knowledgeEntries,
    promisesToPay,
    rulers,
    addDebtor,
    updateDebtor,
    addMessage,
    addKnowledgeEntry,
    updateKnowledgeEntry,
    approveKnowledge,
    rejectKnowledge,
    addPromiseToPay
  }), [debtors, installments, conversations, knowledgeEntries, promisesToPay, rulers]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
