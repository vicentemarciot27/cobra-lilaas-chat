-- Seed data for testing and development
-- This script populates the database with sample data

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE messages, conversations, knowledge_entries, promises_to_pay, installments, debtors, rulers CASCADE;

-- Insert sample debtors
INSERT INTO debtors (id, name, cpf, phone, email, apartment, profile, created_at, updated_at) VALUES
('d1', 'João Silva', '123.456.789-00', '(11) 98765-4321', 'joao.silva@email.com', '101', 'good_payer', NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 days'),
('d2', 'Maria Santos', '987.654.321-00', '(11) 91234-5678', 'maria.santos@email.com', '202', 'bad_payer', NOW() - INTERVAL '45 days', NOW() - INTERVAL '2 days'),
('d3', 'Pedro Costa', '456.789.123-00', '(11) 97777-8888', 'pedro.costa@email.com', '303', 'new', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

-- Insert sample installments
INSERT INTO installments (id, debtor_id, due_date, value, status, created_at) VALUES
('i1', 'd1', CURRENT_DATE - INTERVAL '10 days', 500.00, 'paid', NOW() - INTERVAL '30 days'),
('i2', 'd1', CURRENT_DATE + INTERVAL '20 days', 500.00, 'future', NOW() - INTERVAL '30 days'),
('i3', 'd2', CURRENT_DATE - INTERVAL '30 days', 750.00, 'overdue', NOW() - INTERVAL '45 days'),
('i4', 'd2', CURRENT_DATE - INTERVAL '15 days', 750.00, 'overdue', NOW() - INTERVAL '45 days'),
('i5', 'd3', CURRENT_DATE + INTERVAL '5 days', 300.00, 'future', NOW() - INTERVAL '10 days');

-- Insert sample conversations
INSERT INTO conversations (id, debtor_id, created_at, updated_at) VALUES
('c1', 'd1', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('c2', 'd2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

-- Insert sample messages
INSERT INTO messages (conversation_id, role, content, timestamp) VALUES
('c1', 'agent', 'Olá João! Tudo bem? Notamos que você tem uma parcela vencendo em breve.', NOW() - INTERVAL '5 days'),
('c1', 'user', 'Oi! Sim, eu lembro. Vou pagar na data certinho.', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes'),
('c1', 'agent', 'Ótimo! Obrigado pela confirmação. Qualquer dúvida, estou à disposição.', NOW() - INTERVAL '5 days' + INTERVAL '10 minutes'),
('c2', 'agent', 'Oi Maria, tudo bem? Vi que você tem algumas parcelas em atraso. Podemos conversar sobre isso?', NOW() - INTERVAL '2 days'),
('c2', 'user', 'Oi, desculpa o atraso. Tive alguns imprevistos. Consigo pagar até o fim do mês?', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes');

-- Insert sample knowledge entries
INSERT INTO knowledge_entries (debtor_id, conversation_id, category, tags, title, content, confidence_level, source, status, created_at) VALUES
('d1', 'c1', 'behavior', ARRAY['pontual', 'responsável'], 'Devedor sempre paga em dia', 'João sempre confirma o pagamento e honra seus compromissos financeiros.', 0.95, 'ai', 'approved', NOW() - INTERVAL '5 days'),
('d2', 'c2', 'financial', ARRAY['dificuldade', 'flexibilidade'], 'Dificuldades financeiras temporárias', 'Maria está passando por dificuldades financeiras, mas demonstra interesse em negociar.', 0.85, 'ai', 'pending', NOW() - INTERVAL '2 days'),
('d1', NULL, 'communication', ARRAY['disponível', 'responsivo'], 'Comunicação efetiva', 'Devedor responde rapidamente às mensagens e mantém comunicação clara.', 0.90, 'manual', 'approved', NOW() - INTERVAL '10 days');

-- Insert sample promises to pay
INSERT INTO promises_to_pay (debtor_id, installment_id, amount_promised, promised_datetime, fulfilled, created_at) VALUES
('d1', 'i1', 500.00, NOW() - INTERVAL '10 days', true, NOW() - INTERVAL '15 days'),
('d2', 'c2', 750.00, NOW() + INTERVAL '25 days', false, NOW() - INTERVAL '2 days');

-- Insert sample rulers (workflow configurations)
INSERT INTO rulers (id, name, profile_target, json_data, agent_config, is_active, created_at) VALUES
('r1', 'Régua Bom Pagador', 'good_payer', 
 '{"workflow": {"nodes": [], "edges": []}}',
 '{"tone": "friendly", "toneDescription": "Tom amigável e apreciativo", "adaptiveTiming": true, "negotiationEnabled": false, "negotiationPolicy": {"maxDiscount": 5, "maxInstallments": 2, "minInstallmentValue": 100}}',
 true, NOW() - INTERVAL '60 days'),
('r2', 'Régua Inadimplente', 'bad_payer',
 '{"workflow": {"nodes": [], "edges": []}}',
 '{"tone": "firm", "toneDescription": "Tom firme mas respeitoso", "adaptiveTiming": true, "negotiationEnabled": true, "negotiationPolicy": {"maxDiscount": 20, "maxInstallments": 6, "minInstallmentValue": 50}}',
 true, NOW() - INTERVAL '60 days'),
('r3', 'Régua Novo Cliente', 'new',
 '{"workflow": {"nodes": [], "edges": []}}',
 '{"tone": "neutral", "toneDescription": "Tom neutro e profissional", "adaptiveTiming": false, "negotiationEnabled": true, "negotiationPolicy": {"maxDiscount": 10, "maxInstallments": 3, "minInstallmentValue": 100}}',
 true, NOW() - INTERVAL '60 days');

-- Display summary
SELECT 
    'Debtors' as table_name, COUNT(*) as records FROM debtors
UNION ALL
SELECT 'Installments', COUNT(*) FROM installments
UNION ALL
SELECT 'Conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Knowledge Entries', COUNT(*) FROM knowledge_entries
UNION ALL
SELECT 'Promises to Pay', COUNT(*) FROM promises_to_pay
UNION ALL
SELECT 'Rulers', COUNT(*) FROM rulers;

