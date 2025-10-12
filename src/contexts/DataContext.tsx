import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  initialDebtors,
  initialInstallments,
  initialConversations,
  initialKnowledgeEntries,
  initialPromisesToPay,
  initialRulers
} from '@/data/defaults';

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

export interface WorkflowData {
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
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
  saveWorkflow: (rulerId: string, workflowData: WorkflowData) => void;
  getWorkflow: (rulerId: string) => WorkflowData | null;
  updateRuler: (id: string, updates: Partial<Ruler>) => void;
  deleteRuler: (id: string) => void;
  addRuler: (ruler: Ruler) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(initialKnowledgeEntries);
  const [promisesToPay, setPromisesToPay] = useState<PromiseToPay[]>(initialPromisesToPay);
  const [rulers, setRulers] = useState<Ruler[]>(initialRulers);

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

  const saveWorkflow = (rulerId: string, workflowData: WorkflowData) => {
    setRulers(prev => prev.map(r => 
      r.id === rulerId 
        ? { ...r, json_data: { ...r.json_data, workflow: workflowData } }
        : r
    ));
  };

  const getWorkflow = (rulerId: string): WorkflowData | null => {
    const ruler = rulers.find(r => r.id === rulerId);
    if (!ruler) return null;
    const workflow = (ruler.json_data as any).workflow;
    return workflow || null;
  };

  const updateRuler = (id: string, updates: Partial<Ruler>) => {
    setRulers(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRuler = (id: string) => {
    setRulers(prev => prev.filter(r => r.id !== id));
  };

  const addRuler = (ruler: Ruler) => {
    setRulers(prev => [...prev, ruler]);
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
    addPromiseToPay,
    saveWorkflow,
    getWorkflow,
    updateRuler,
    deleteRuler,
    addRuler
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
