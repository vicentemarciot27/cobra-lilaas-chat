// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Debtor,
  Installment,
  Conversation,
  Message,
  KnowledgeEntry,
  PromiseToPay,
  Ruler,
  AgentConfig
} from '@/contexts/DataContext';

export function useSupabaseSync() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all debtors
  const fetchDebtors = async (): Promise<Debtor[]> => {
    const { data, error } = await supabase
      .from('debtors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as any[]) as Debtor[];
  };

  // Fetch all installments
  const fetchInstallments = async (): Promise<Installment[]> => {
    const { data, error } = await supabase
      .from('installments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return (data as any[]) as Installment[];
  };

  // Fetch all conversations with messages
  const fetchConversations = async (): Promise<Conversation[]> => {
    const { data: conversationsData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (convError) throw convError;

    const { data: messagesData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });

    if (msgError) throw msgError;

    const messages = messagesData as any[] || [];
    const conversations = conversationsData as any[] || [];

    // Group messages by conversation
    return conversations.map(conv => ({
      ...conv,
      messages: messages
        .filter((msg: any) => msg.conversation_id === conv.id)
        .map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          tool_used: msg.tool_used || undefined,
          knowledge_extracted: msg.knowledge_extracted || undefined,
        })),
    })) as Conversation[];
  };

  // Fetch all knowledge entries
  const fetchKnowledgeEntries = async (): Promise<KnowledgeEntry[]> => {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data as any[]) || []).map((entry: any) => ({
      ...entry,
      conversation_id: entry.conversation_id || undefined,
    })) as KnowledgeEntry[];
  };

  // Fetch all promises to pay
  const fetchPromisesToPay = async (): Promise<PromiseToPay[]> => {
    const { data, error } = await supabase
      .from('promises_to_pay')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data as any[]) || []).map((promise: any) => ({
      ...promise,
      observation: promise.observation || undefined,
    })) as PromiseToPay[];
  };

  // Fetch all rulers
  const fetchRulers = async (): Promise<Ruler[]> => {
    const { data, error } = await supabase
      .from('rulers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return ((data as any[]) || []).map((ruler: any) => ({
      ...ruler,
      json_data: ruler.json_data as object,
      agent_config: ruler.agent_config as AgentConfig,
    })) as Ruler[];
  };

  // Insert a new debtor
  const insertDebtor = async (debtor: Omit<Debtor, 'id' | 'created_at' | 'updated_at'>): Promise<Debtor> => {
    const { data, error } = await supabase
      .from('debtors')
      .insert([debtor as any])
      .select()
      .single();

    if (error) throw error;
    return data as Debtor;
  };

  // Update a debtor
  const updateDebtor = async (id: string, updates: Partial<Debtor>): Promise<Debtor> => {
    const { data, error } = await supabase
      .from('debtors')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Debtor;
  };

  // Insert a message
  const insertMessage = async (conversationId: string, message: Omit<Message, 'timestamp'>): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        tool_used: message.tool_used || null,
        knowledge_extracted: message.knowledge_extracted || null,
      } as any]);

    if (error) throw error;

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() } as any)
      .eq('id', conversationId);
  };

  // Insert a knowledge entry
  const insertKnowledgeEntry = async (entry: Omit<KnowledgeEntry, 'id' | 'created_at'>): Promise<KnowledgeEntry> => {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .insert([{
        ...entry,
        conversation_id: entry.conversation_id || null,
      } as any])
      .select()
      .single();

    if (error) throw error;
    const result = data as any;
    return {
      ...result,
      conversation_id: result.conversation_id || undefined,
    } as KnowledgeEntry;
  };

  // Update a knowledge entry
  const updateKnowledgeEntry = async (id: string, updates: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> => {
    const { data, error } = await supabase
      .from('knowledge_entries')
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const result = data as any;
    return {
      ...result,
      conversation_id: result.conversation_id || undefined,
    } as KnowledgeEntry;
  };

  // Insert a promise to pay
  const insertPromiseToPay = async (promise: Omit<PromiseToPay, 'id' | 'created_at'>): Promise<PromiseToPay> => {
    const { data, error } = await supabase
      .from('promises_to_pay')
      .insert([{
        ...promise,
        observation: promise.observation || null,
      } as any])
      .select()
      .single();

    if (error) throw error;
    const result = data as any;
    return {
      ...result,
      observation: result.observation || undefined,
    } as PromiseToPay;
  };

  // Update a ruler
  const updateRuler = async (id: string, updates: Partial<Ruler>): Promise<Ruler> => {
    const { data, error } = await supabase
      .from('rulers')
      .update({
        ...updates,
        json_data: updates.json_data as any,
        agent_config: updates.agent_config as any,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    const result = data as any;
    return {
      ...result,
      json_data: result.json_data as object,
      agent_config: result.agent_config as AgentConfig,
    } as Ruler;
  };

  // Delete a ruler
  const deleteRuler = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('rulers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  // Insert a ruler
  const insertRuler = async (ruler: Omit<Ruler, 'id' | 'created_at'>): Promise<Ruler> => {
    const { data, error } = await supabase
      .from('rulers')
      .insert([{
        ...ruler,
        json_data: ruler.json_data as any,
        agent_config: ruler.agent_config as any,
      } as any])
      .select()
      .single();

    if (error) throw error;
    const result = data as any;
    return {
      ...result,
      json_data: result.json_data as object,
      agent_config: result.agent_config as AgentConfig,
    } as Ruler;
  };

  return {
    isLoading,
    error,
    fetchDebtors,
    fetchInstallments,
    fetchConversations,
    fetchKnowledgeEntries,
    fetchPromisesToPay,
    fetchRulers,
    insertDebtor,
    updateDebtor,
    insertMessage,
    insertKnowledgeEntry,
    updateKnowledgeEntry,
    insertPromiseToPay,
    updateRuler,
    deleteRuler,
    insertRuler,
  };
}
