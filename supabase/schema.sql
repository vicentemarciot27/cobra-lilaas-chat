-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE debtor_profile AS ENUM ('good_payer', 'bad_payer', 'new');
CREATE TYPE installment_status AS ENUM ('paid', 'renegotiated', 'overdue', 'future');
CREATE TYPE knowledge_category AS ENUM ('behavior', 'communication', 'financial', 'payment');
CREATE TYPE knowledge_status AS ENUM ('approved', 'pending', 'rejected');
CREATE TYPE knowledge_source AS ENUM ('manual', 'ai');
CREATE TYPE message_role AS ENUM ('agent', 'user');
CREATE TYPE agent_tone AS ENUM ('friendly', 'neutral', 'formal', 'firm');

-- Debtors table
CREATE TABLE debtors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  apartment TEXT NOT NULL,
  profile debtor_profile NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installments table
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  value NUMERIC(10, 2) NOT NULL,
  status installment_status NOT NULL DEFAULT 'future',
  renegotiated_id UUID REFERENCES installments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tool_used TEXT,
  knowledge_extracted TEXT
);

-- Knowledge entries table
CREATE TABLE knowledge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  category knowledge_category NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  confidence_level NUMERIC(3, 2) NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 1),
  source knowledge_source NOT NULL DEFAULT 'manual',
  status knowledge_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promises to pay table
CREATE TABLE promises_to_pay (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debtor_id UUID NOT NULL REFERENCES debtors(id) ON DELETE CASCADE,
  installment_id UUID NOT NULL REFERENCES installments(id) ON DELETE CASCADE,
  amount_promised NUMERIC(10, 2) NOT NULL,
  promised_datetime TIMESTAMPTZ NOT NULL,
  fulfilled BOOLEAN NOT NULL DEFAULT FALSE,
  observation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rulers table (workflow configurations)
CREATE TABLE rulers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  profile_target debtor_profile NOT NULL,
  json_data JSONB NOT NULL DEFAULT '{}',
  agent_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_installments_debtor_id ON installments(debtor_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_conversations_debtor_id ON conversations(debtor_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_knowledge_entries_debtor_id ON knowledge_entries(debtor_id);
CREATE INDEX idx_knowledge_entries_status ON knowledge_entries(status);
CREATE INDEX idx_knowledge_entries_category ON knowledge_entries(category);
CREATE INDEX idx_promises_to_pay_debtor_id ON promises_to_pay(debtor_id);
CREATE INDEX idx_promises_to_pay_installment_id ON promises_to_pay(installment_id);
CREATE INDEX idx_rulers_profile_target ON rulers(profile_target);
CREATE INDEX idx_rulers_is_active ON rulers(is_active);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_debtors_updated_at
  BEFORE UPDATE ON debtors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE debtors ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises_to_pay ENABLE ROW LEVEL SECURITY;
ALTER TABLE rulers ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
-- You can customize these policies based on your security requirements
CREATE POLICY "Enable all operations for authenticated users" ON debtors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON installments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON conversations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON messages
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON knowledge_entries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON promises_to_pay
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON rulers
  FOR ALL USING (auth.role() = 'authenticated');

