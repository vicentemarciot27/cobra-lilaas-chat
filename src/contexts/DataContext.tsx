import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { useSupabaseSync } from '@/hooks/use-supabase-sync';
import {
  initialDebtors,
  initialInstallments,
  initialConversations,
  initialKnowledgeEntries,
  initialPromisesToPay,
  initialRulers
} from '@/data/defaults';

// Importação do calculador de métricas centralizado
import { 
  calculateMetricsForMonth as calculateMetricsFromHelper, 
  calculateTotalHistoricalRecovered,
  MetricsData
} from './metrics-helper';

// Types
export type DebtorProfile = 'good_payer' | 'bad_payer' | 'new';
export type InstallmentStatus = 'paid' | 'renegotiated' | 'overdue' | 'future';
export type KnowledgeCategory = 'behavior' | 'communication' | 'financial' | 'payment';
export type KnowledgeStatus = 'approved' | 'pending' | 'rejected';

export interface NegotiationPolicy {
  maxDiscount: number; // Percentage (0-100)
  maxInstallments: number; // Maximum number of installments allowed
  minInstallmentValue: number; // Minimum value per installment
}

export interface AgentConfig {
  tone: 'friendly' | 'neutral' | 'formal' | 'firm';
  toneDescription?: string; // Description of the communication tone
  adaptiveTiming: boolean;
  negotiationEnabled: boolean;
  negotiationPolicy: NegotiationPolicy;
}

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
  payment_date: string | null;
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
  agent_config: AgentConfig;
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
  isLoading: boolean;
  error: Error | null;
  metrics: MetricsData;
  getMetricsForMonth: (month: number, year: number) => MetricsData;
  refreshData: () => Promise<void>;
  addDebtor: (debtor: Omit<Debtor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateDebtor: (id: string, updates: Partial<Debtor>) => Promise<void>;
  addMessage: (conversationId: string, message: Omit<Message, 'timestamp'>) => Promise<void>;
  addKnowledgeEntry: (entry: Omit<KnowledgeEntry, 'id' | 'created_at'>) => Promise<void>;
  updateKnowledgeEntry: (id: string, updates: Partial<KnowledgeEntry>) => Promise<void>;
  approveKnowledge: (id: string) => Promise<void>;
  rejectKnowledge: (id: string) => Promise<void>;
  addPromiseToPay: (promise: Omit<PromiseToPay, 'id' | 'created_at'>) => Promise<void>;
  saveWorkflow: (rulerId: string, workflowData: WorkflowData) => Promise<void>;
  getWorkflow: (rulerId: string) => WorkflowData | null;
  updateRuler: (id: string, updates: Partial<Ruler>) => Promise<void>;
  deleteRuler: (id: string) => Promise<void>;
  addRuler: (ruler: Omit<Ruler, 'id' | 'created_at'>) => Promise<void>;
  addInstallment: (installment: Omit<Installment, 'id' | 'created_at'>) => Promise<Installment>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [debtors, setDebtors] = useState<Debtor[]>(initialDebtors);
  const [installments, setInstallments] = useState<Installment[]>(initialInstallments);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>(initialKnowledgeEntries);
  const [promisesToPay, setPromisesToPay] = useState<PromiseToPay[]>(initialPromisesToPay);
  const [rulers, setRulers] = useState<Ruler[]>(initialRulers);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabaseSync = useSupabaseSync();

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        debtorsData,
        installmentsData,
        conversationsData,
        knowledgeData,
        promisesData,
        rulersData,
      ] = await Promise.all([
        supabaseSync.fetchDebtors(),
        supabaseSync.fetchInstallments(),
        supabaseSync.fetchConversations(),
        supabaseSync.fetchKnowledgeEntries(),
        supabaseSync.fetchPromisesToPay(),
        supabaseSync.fetchRulers(),
      ]);

      setDebtors(debtorsData);
      setInstallments(installmentsData);
      setConversations(conversationsData);
      setKnowledgeEntries(knowledgeData);
      setPromisesToPay(promisesData);
      setRulers(rulersData);
    } catch (err) {
      console.error('Error loading data from Supabase:', err);
      setError(err as Error);
      // Keep using default data on error
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const addDebtor = async (debtor: Omit<Debtor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newDebtor = await supabaseSync.insertDebtor(debtor);
      setDebtors(prev => [...prev, newDebtor]);
    } catch (err) {
      console.error('Error adding debtor:', err);
      throw err;
    }
  };

  const updateDebtor = async (id: string, updates: Partial<Debtor>) => {
    try {
      const updatedDebtor = await supabaseSync.updateDebtor(id, updates);
      setDebtors(prev => prev.map(d => d.id === id ? updatedDebtor : d));
    } catch (err) {
      console.error('Error updating debtor:', err);
      throw err;
    }
  };

  const addMessage = async (conversationId: string, message: Omit<Message, 'timestamp'>) => {
    try {
      await supabaseSync.insertMessage(conversationId, message);
      // Refresh conversations to get the new message
      const conversationsData = await supabaseSync.fetchConversations();
      setConversations(conversationsData);
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };

  const addKnowledgeEntry = async (entry: Omit<KnowledgeEntry, 'id' | 'created_at'>) => {
    try {
      const newEntry = await supabaseSync.insertKnowledgeEntry(entry);
      setKnowledgeEntries(prev => [...prev, newEntry]);
    } catch (err) {
      console.error('Error adding knowledge entry:', err);
      throw err;
    }
  };

  const updateKnowledgeEntry = async (id: string, updates: Partial<KnowledgeEntry>) => {
    try {
      const updatedEntry = await supabaseSync.updateKnowledgeEntry(id, updates);
      setKnowledgeEntries(prev => prev.map(e => e.id === id ? updatedEntry : e));
    } catch (err) {
      console.error('Error updating knowledge entry:', err);
      throw err;
    }
  };

  const approveKnowledge = async (id: string) => {
    await updateKnowledgeEntry(id, { status: 'approved' });
  };

  const rejectKnowledge = async (id: string) => {
    await updateKnowledgeEntry(id, { status: 'rejected' });
  };

  const addPromiseToPay = async (promise: Omit<PromiseToPay, 'id' | 'created_at'>) => {
    try {
      const newPromise = await supabaseSync.insertPromiseToPay(promise);
      setPromisesToPay(prev => [...prev, newPromise]);
    } catch (err) {
      console.error('Error adding promise to pay:', err);
      throw err;
    }
  };

  const saveWorkflow = async (rulerId: string, workflowData: WorkflowData) => {
    try {
      const ruler = rulers.find(r => r.id === rulerId);
      if (!ruler) throw new Error('Ruler not found');

      const updatedRuler = await supabaseSync.updateRuler(rulerId, {
        json_data: { ...ruler.json_data, workflow: workflowData }
      });
      setRulers(prev => prev.map(r => r.id === rulerId ? updatedRuler : r));
    } catch (err) {
      console.error('Error saving workflow:', err);
      throw err;
    }
  };

  const getWorkflow = (rulerId: string): WorkflowData | null => {
    const ruler = rulers.find(r => r.id === rulerId);
    if (!ruler) return null;
    const workflow = (ruler.json_data as any).workflow;
    return workflow || null;
  };

  const updateRuler = async (id: string, updates: Partial<Ruler>) => {
    try {
      const updatedRuler = await supabaseSync.updateRuler(id, updates);
      setRulers(prev => prev.map(r => r.id === id ? updatedRuler : r));
    } catch (err) {
      console.error('Error updating ruler:', err);
      throw err;
    }
  };

  const deleteRuler = async (id: string) => {
    try {
      await supabaseSync.deleteRuler(id);
      setRulers(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting ruler:', err);
      throw err;
    }
  };

  const addRuler = async (ruler: Omit<Ruler, 'id' | 'created_at'>) => {
    try {
      const newRuler = await supabaseSync.insertRuler(ruler);
      setRulers(prev => [...prev, newRuler]);
    } catch (err) {
      console.error('Error adding ruler:', err);
      throw err;
    }
  };

  // Wrapper para o calculador centralizado
  const calculateMetricsForMonth = (month: number, year: number) => {
    return calculateMetricsFromHelper(month, year, {
      debtors,
      installments,
      conversations,
      promisesToPay
    });
  };

  const metrics: MetricsData = useMemo(() => {
    // Usar a data atual para o cálculo de métricas padrão
    const now = new Date('2025-10-12'); // Data atual conforme especificado
    return calculateMetricsForMonth(now.getMonth(), now.getFullYear());
  }, [debtors, installments, conversations, promisesToPay]);
  
  // Função para obter métricas para qualquer mês
  const getMetricsForMonth = (month: number, year: number): MetricsData => {
    return calculateMetricsForMonth(month, year);
  };
  
  const addInstallment = async (installment: Omit<Installment, 'id' | 'created_at'>) => {
    try {
      const now = new Date().toISOString();
      const newInstallment: Installment = {
        id: `installment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: now,
        ...installment
      };
      
      // Em um ambiente real, chamaríamos o Supabase aqui
      // await supabaseSync.insertInstallment(newInstallment);
      
      setInstallments(prev => [...prev, newInstallment]);
      return newInstallment;
    } catch (err) {
      console.error('Error adding installment:', err);
      throw err;
    }
  };

  const value = useMemo(() => ({
    debtors,
    installments,
    conversations,
    knowledgeEntries,
    promisesToPay,
    rulers,
    isLoading,
    error,
    metrics,
    getMetricsForMonth,
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
    addInstallment
  }), [debtors, installments, conversations, knowledgeEntries, promisesToPay, rulers, isLoading, error, metrics]);

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
