export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      debtors: {
        Row: {
          id: string
          name: string
          cpf: string
          phone: string
          email: string
          apartment: string
          profile: 'good_payer' | 'bad_payer' | 'new'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cpf: string
          phone: string
          email: string
          apartment: string
          profile?: 'good_payer' | 'bad_payer' | 'new'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cpf?: string
          phone?: string
          email?: string
          apartment?: string
          profile?: 'good_payer' | 'bad_payer' | 'new'
          created_at?: string
          updated_at?: string
        }
      }
      installments: {
        Row: {
          id: string
          debtor_id: string
          due_date: string
          value: number
          status: 'paid' | 'renegotiated' | 'overdue' | 'future'
          renegotiated_id: string | null
          created_at: string
          payment_date: string | null
        }
        Insert: {
          id?: string
          debtor_id: string
          due_date: string
          value: number
          status?: 'paid' | 'renegotiated' | 'overdue' | 'future'
          renegotiated_id?: string | null
          created_at?: string
          payment_date?: string | null
        }
        Update: {
          id?: string
          debtor_id?: string
          due_date?: string
          value?: number
          status?: 'paid' | 'renegotiated' | 'overdue' | 'future'
          renegotiated_id?: string | null
          created_at?: string
          payment_date?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          debtor_id: string
          created_at: string
          updated_at: string
          payment_date: string | null
        }
        Insert: {
          id?: string
          debtor_id: string
          created_at?: string
          updated_at?: string
          payment_date?: string | null
        }
        Update: {
          id?: string
          debtor_id?: string
          created_at?: string
          updated_at?: string
          payment_date?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'agent' | 'user'
          content: string
          timestamp: string
          tool_used: string | null
          knowledge_extracted: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'agent' | 'user'
          content: string
          timestamp?: string
          tool_used?: string | null
          knowledge_extracted?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'agent' | 'user'
          content?: string
          timestamp?: string
          tool_used?: string | null
          knowledge_extracted?: string | null
        }
      }
      knowledge_entries: {
        Row: {
          id: string
          debtor_id: string
          conversation_id: string | null
          category: 'behavior' | 'communication' | 'financial' | 'payment'
          tags: string[]
          title: string
          content: string
          confidence_level: number
          source: 'manual' | 'ai'
          status: 'approved' | 'pending' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          debtor_id: string
          conversation_id?: string | null
          category: 'behavior' | 'communication' | 'financial' | 'payment'
          tags?: string[]
          title: string
          content: string
          confidence_level: number
          source?: 'manual' | 'ai'
          status?: 'approved' | 'pending' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          debtor_id?: string
          conversation_id?: string | null
          category?: 'behavior' | 'communication' | 'financial' | 'payment'
          tags?: string[]
          title?: string
          content?: string
          confidence_level?: number
          source?: 'manual' | 'ai'
          status?: 'approved' | 'pending' | 'rejected'
          created_at?: string
        }
      }
      promises_to_pay: {
        Row: {
          id: string
          debtor_id: string
          installment_id: string
          amount_promised: number
          promised_datetime: string
          fulfilled: boolean
          observation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          debtor_id: string
          installment_id: string
          amount_promised: number
          promised_datetime: string
          fulfilled?: boolean
          observation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          debtor_id?: string
          installment_id?: string
          amount_promised?: number
          promised_datetime?: string
          fulfilled?: boolean
          observation?: string | null
          created_at?: string
        }
      }
      rulers: {
        Row: {
          id: string
          name: string
          profile_target: 'good_payer' | 'bad_payer' | 'new'
          json_data: Json
          agent_config: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          profile_target: 'good_payer' | 'bad_payer' | 'new'
          json_data?: Json
          agent_config?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          profile_target?: 'good_payer' | 'bad_payer' | 'new'
          json_data?: Json
          agent_config?: Json
          is_active?: boolean
          created_at?: string
        }
      }
    }
  }
}

