// DATA ATUAL CONSIDERADA: 2025-10-12 (America/Sao_Paulo)


export const initialDebtors = [
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
    profile: 'good_payer',
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
  },
  {
    id: '6',
    name: 'Laura Almeida',
    cpf: '102.223.344-55',
    phone: '(11) 97654-3210',
    email: 'laura.almeida@email.com',
    apartment: '202',
    profile: 'good_payer',
    created_at: '2024-06-10T08:20:00Z',
    updated_at: '2025-10-10T13:12:00Z'
  },
  {
    id: '7',
    name: 'Ricardo Nunes',
    cpf: '114.334.556-77',
    phone: '(11) 95555-6789',
    email: 'ricardo.nunes@email.com',
    apartment: '206',
    profile: 'bad_payer',
    created_at: '2024-07-12T12:00:00Z',
    updated_at: '2025-10-11T16:06:00Z'
  },
  {
    id: '8',
    name: 'Fernanda Lima',
    cpf: '908.112.334-00',
    phone: '(11) 99999-0000',
    email: 'fernanda.lima@email.com',
    apartment: '501',
    profile: 'good_payer',
    created_at: '2024-06-15T09:40:00Z',
    updated_at: '2025-10-09T08:42:00Z'
  },
  {
    id: '9',
    name: 'André Souza',
    cpf: '119.887.665-88',
    phone: '(11) 93456-7788',
    email: 'andre.souza@email.com',
    apartment: '307',
    profile: 'bad_payer',
    created_at: '2024-04-20T13:10:00Z',
    updated_at: '2025-10-04T17:23:00Z'
  },
  {
    id: '10',
    name: 'Beatriz Rocha',
    cpf: '998.112.334-77',
    phone: '(11) 97777-8888',
    email: 'beatriz.rocha@email.com',
    apartment: '602',
    profile: 'new',
    created_at: '2025-10-01T10:05:00Z',
    updated_at: '2025-10-02T09:03:00Z'
  }
];


export const initialInstallments = [
  // Debtor 1 — João (misto: atrasou outubro, quer parcelar; meses anteriores pagos)
  { id: 'i1', debtor_id: '1', due_date: '2025-08-05', value: 750, status: 'paid', created_at: '2025-07-01T10:00:00Z' },
  { id: 'i2', debtor_id: '1', due_date: '2025-09-05', value: 750, status: 'paid', created_at: '2025-08-01T10:00:00Z' },
  { id: 'i3', debtor_id: '1', due_date: '2025-10-05', value: 750, status: 'overdue', created_at: '2025-09-01T10:00:00Z' },
  { id: 'i4', debtor_id: '1', due_date: '2025-11-05', value: 750, status: 'future', created_at: '2025-10-01T10:00:00Z' },
  { id: 'i5', debtor_id: '1', due_date: '2025-12-05', value: 750, status: 'future', created_at: '2025-11-01T10:00:00Z' },

  // Debtor 2 — (ruim: vários atrasos em sequência)
  { id: 'i6',  debtor_id: '2', due_date: '2025-06-05', value: 850, status: 'overdue', created_at: '2025-05-01T14:30:00Z' },
  { id: 'i7',  debtor_id: '2', due_date: '2025-07-05', value: 850, status: 'overdue', created_at: '2025-06-01T14:30:00Z' },
  { id: 'i8',  debtor_id: '2', due_date: '2025-08-05', value: 850, status: 'overdue', created_at: '2025-07-01T14:30:00Z' },
  { id: 'i9',  debtor_id: '2', due_date: '2025-09-05', value: 850, status: 'overdue', created_at: '2025-08-01T14:30:00Z' },
  { id: 'i10', debtor_id: '2', due_date: '2025-10-05', value: 850, status: 'overdue', created_at: '2025-09-01T14:30:00Z' },
  { id: 'i11', debtor_id: '2', due_date: '2025-11-05', value: 850, status: 'future',  created_at: '2025-10-01T14:30:00Z' },

  // Debtor 3 — (misto: outubro atrasado, demais ok/futuro)
  { id: 'i12', debtor_id: '3', due_date: '2025-09-01', value: 1200, status: 'paid',    created_at: '2025-08-01T09:00:00Z' },
  { id: 'i13', debtor_id: '3', due_date: '2025-10-01', value: 1200, status: 'overdue', created_at: '2025-09-01T09:00:00Z' },
  { id: 'i14', debtor_id: '3', due_date: '2025-11-01', value: 1200, status: 'future',  created_at: '2025-10-01T09:00:00Z' },
  { id: 'i15', debtor_id: '3', due_date: '2025-12-01', value: 1200, status: 'future',  created_at: '2025-11-01T09:00:00Z' },

  // Debtor 4 — (bom pagador: histórico excelente; outubro atrasou mas prometeu e costuma cumprir)
  { id: 'i16', debtor_id: '4', due_date: '2025-07-03', value: 950, status: 'paid',    created_at: '2025-06-10T11:15:00Z' },
  { id: 'i17', debtor_id: '4', due_date: '2025-08-03', value: 950, status: 'paid',    created_at: '2025-07-10T11:15:00Z' },
  { id: 'i18', debtor_id: '4', due_date: '2025-09-03', value: 950, status: 'paid',    created_at: '2025-08-10T11:15:00Z' },
  { id: 'i19', debtor_id: '4', due_date: '2025-10-03', value: 950, status: 'overdue', created_at: '2025-09-10T11:15:00Z' },
  { id: 'i20', debtor_id: '4', due_date: '2025-11-03', value: 950, status: 'future',  created_at: '2025-10-10T11:15:00Z' },

  // Debtor 5 — (ruim/agressivo)
  { id: 'i21', debtor_id: '5', due_date: '2025-07-05', value: 1100, status: 'overdue', created_at: '2025-06-05T15:45:00Z' },
  { id: 'i22', debtor_id: '5', due_date: '2025-08-05', value: 1100, status: 'overdue', created_at: '2025-07-05T15:45:00Z' },
  { id: 'i23', debtor_id: '5', due_date: '2025-09-05', value: 1100, status: 'overdue', created_at: '2025-08-05T15:45:00Z' },
  { id: 'i24', debtor_id: '5', due_date: '2025-10-05', value: 1100, status: 'overdue', created_at: '2025-09-05T15:45:00Z' },

  // Debtor 6 — (excelente pagador com débito automático)
  { id: 'i25', debtor_id: '6', due_date: '2025-07-10', value: 650, status: 'paid',   created_at: '2025-06-10T08:20:00Z' },
  { id: 'i26', debtor_id: '6', due_date: '2025-08-10', value: 650, status: 'paid',   created_at: '2025-07-10T08:20:00Z' },
  { id: 'i27', debtor_id: '6', due_date: '2025-09-10', value: 650, status: 'paid',   created_at: '2025-08-10T08:20:00Z' },
  { id: 'i28', debtor_id: '6', due_date: '2025-10-10', value: 650, status: 'paid',   created_at: '2025-09-10T08:20:00Z' },
  { id: 'i29', debtor_id: '6', due_date: '2025-11-10', value: 650, status: 'future', created_at: '2025-10-10T08:20:00Z' },

  // Debtor 7 — (misto/atrasando agora)
  { id: 'i30', debtor_id: '7', due_date: '2025-08-12', value: 980, status: 'overdue', created_at: '2025-07-12T12:00:00Z' },
  { id: 'i31', debtor_id: '7', due_date: '2025-09-12', value: 980, status: 'overdue', created_at: '2025-08-12T12:00:00Z' },
  { id: 'i32', debtor_id: '7', due_date: '2025-10-12', value: 980, status: 'overdue', created_at: '2025-09-12T12:00:00Z' },
  { id: 'i33', debtor_id: '7', due_date: '2025-11-12', value: 980, status: 'future',  created_at: '2025-10-12T12:00:00Z' },

  // Debtor 8 — (ótimo pagador; alto valor)
  { id: 'i34', debtor_id: '8', due_date: '2025-07-15', value: 1400, status: 'paid',   created_at: '2025-06-15T09:40:00Z' },
  { id: 'i35', debtor_id: '8', due_date: '2025-08-15', value: 1400, status: 'paid',   created_at: '2025-07-15T09:40:00Z' },
  { id: 'i36', debtor_id: '8', due_date: '2025-09-15', value: 1400, status: 'paid',   created_at: '2025-08-15T09:40:00Z' },
  { id: 'i37', debtor_id: '8', due_date: '2025-10-15', value: 1400, status: 'future', created_at: '2025-09-15T09:40:00Z' },

  // Debtor 9 — (ruim crônico: sequência longa de atrasos)
  { id: 'i38', debtor_id: '9', due_date: '2025-05-20', value: 780, status: 'overdue', created_at: '2025-04-20T13:10:00Z' },
  { id: 'i39', debtor_id: '9', due_date: '2025-06-20', value: 780, status: 'overdue', created_at: '2025-05-20T13:10:00Z' },
  { id: 'i40', debtor_id: '9', due_date: '2025-07-20', value: 780, status: 'overdue', created_at: '2025-06-20T13:10:00Z' },
  { id: 'i41', debtor_id: '9', due_date: '2025-08-20', value: 780, status: 'overdue', created_at: '2025-07-20T13:10:00Z' },
  { id: 'i42', debtor_id: '9', due_date: '2025-09-20', value: 780, status: 'overdue', created_at: '2025-08-20T13:10:00Z' },

  // Debtor 10 — (novo contrato, tudo futuro)
  { id: 'i43', debtor_id: '10', due_date: '2025-10-25', value: 900, status: 'future', created_at: '2025-10-01T10:05:00Z' },
  { id: 'i44', debtor_id: '10', due_date: '2025-11-25', value: 900, status: 'future', created_at: '2025-10-01T10:05:00Z' },
  { id: 'i45', debtor_id: '10', due_date: '2025-12-25', value: 900, status: 'future', created_at: '2025-10-01T10:05:00Z' },
];

export const initialConversations = [
  // 1 — João
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
  },

  // 2 — Evasivo
  {
    id: 'c2',
    debtor_id: '2',
    messages: [
      { role: 'agent', content: 'Olá! Identificamos 5 parcelas em aberto, incluindo a de 05/10 (R$850). Podemos conversar sobre uma proposta?', timestamp: '2025-10-07T13:00:00Z' },
      { role: 'user', content: 'Não reconheço esses valores.', timestamp: '2025-10-07T15:12:00Z' },
      { role: 'agent', content: 'Sem problemas. Vou te enviar o extrato detalhado com todos os comprovantes.', timestamp: '2025-10-07T15:14:00Z', tool_used: 'Enviou comprovantes', knowledge_extracted: 'Disputa de valores' }
    ],
    created_at: '2025-10-07T13:00:00Z',
    updated_at: '2025-10-07T15:14:00Z'
  },

  // 3 — Organizado, atrasou outubro
  {
    id: 'c3',
    debtor_id: '3',
    messages: [
      { role: 'agent', content: 'Bom dia! A parcela de R$1200 com vencimento em 01/10 está em aberto. Posso te ajudar?', timestamp: '2025-10-08T10:00:00Z' },
      { role: 'user', content: 'Tive um imprevisto. Pago dia 18/10.', timestamp: '2025-10-08T10:05:00Z' },
      { role: 'agent', content: 'Anotado: pagamento integral em 18/10. Te envio o boleto com vencimento nessa data.', timestamp: '2025-10-08T10:06:00Z', tool_used: 'Promessa registrada', knowledge_extracted: 'Paga no meio do mês' }
    ],
    created_at: '2025-10-08T10:00:00Z',
    updated_at: '2025-10-08T10:06:00Z'
  },

  // 4 — Bom relacionamento
  {
    id: 'c4',
    debtor_id: '4',
    messages: [
      { role: 'agent', content: 'Oi! O vencimento de 03/10 (R$950) está em aberto. Quer dividir em 3x de R$320?', timestamp: '2025-10-09T14:18:00Z' },
      { role: 'user', content: 'Pode ser. Pago a primeira no dia 15/10.', timestamp: '2025-10-09T14:19:30Z' },
      { role: 'agent', content: 'Combinado! Registro feito e te envio os boletos agendados.', timestamp: '2025-10-09T14:20:00Z', tool_used: 'Quebrou em parcelas', knowledge_extracted: 'Cumpre promessas' }
    ],
    created_at: '2025-10-09T14:18:00Z',
    updated_at: '2025-10-09T14:20:00Z'
  },

  // 5 — Agressivo
  {
    id: 'c5',
    debtor_id: '5',
    messages: [
      { role: 'agent', content: 'Olá! Vimos que os boletos de 07/07, 05/08, 05/09 e 05/10 estão pendentes (R$1.100 cada). Como podemos resolver?', timestamp: '2025-10-06T09:30:00Z' },
      { role: 'user', content: 'Isso é um abuso. Vou processar vocês.', timestamp: '2025-10-06T09:31:00Z' },
      { role: 'agent', content: 'Entendo sua insatisfação. Posso encaminhar os contratos e planilha de cálculo para conferência e oferecer um acordo com desconto à vista.', timestamp: '2025-10-06T09:33:00Z', tool_used: 'Aplicou desconto', knowledge_extracted: 'Ameaça ação judicial' }
    ],
    created_at: '2025-10-06T09:30:00Z',
    updated_at: '2025-10-06T09:33:00Z'
  },

  // 6 — Débito automático
  {
    id: 'c6',
    debtor_id: '6',
    messages: [
      { role: 'agent', content: 'Oi! Confirmando: recebemos o débito de 10/10 (R$650). Obrigado!', timestamp: '2025-10-10T13:10:00Z' },
      { role: 'user', content: 'Perfeito. Deixa no automático mesmo.', timestamp: '2025-10-10T13:11:00Z' }
    ],
    created_at: '2025-10-10T13:10:00Z',
    updated_at: '2025-10-10T13:11:00Z'
  },

  // 7 — Atrasando agora
  {
    id: 'c7',
    debtor_id: '7',
    messages: [
      { role: 'agent', content: 'Oi! As parcelas de 12/08 e 12/09 seguem em aberto. Podemos alinhar um pagamento inicial?', timestamp: '2025-10-11T16:00:00Z' },
      { role: 'user', content: 'Consigo R$490 na terça.', timestamp: '2025-10-11T16:05:00Z' },
      { role: 'agent', content: 'Ótimo, registro um sinal de R$490 para 15/10 e reprogramo o restante.', timestamp: '2025-10-11T16:06:00Z', tool_used: 'Promessa registrada', knowledge_extracted: 'Aceita entrada' }
    ],
    created_at: '2025-10-11T16:00:00Z',
    updated_at: '2025-10-11T16:06:00Z'
  },

  // 8 — Premium/organizado
  {
    id: 'c8',
    debtor_id: '8',
    messages: [
      { role: 'agent', content: 'Olá! Seu boleto de 15/10 (R$1.400) já está disponível. Deseja PIX ou débito?', timestamp: '2025-10-09T08:40:00Z' },
      { role: 'user', content: 'Pode débito no dia 15 mesmo.', timestamp: '2025-10-09T08:42:00Z' }
    ],
    created_at: '2025-10-09T08:40:00Z',
    updated_at: '2025-10-09T08:42:00Z'
  },

  // 9 — Evasivo crônico
  {
    id: 'c9',
    debtor_id: '9',
    messages: [
      { role: 'agent', content: 'Identificamos 5 parcelas em aberto desde maio. Precisamos de um plano mínimo para evitar medidas legais.', timestamp: '2025-10-04T17:20:00Z' },
      { role: 'user', content: 'Falo depois.', timestamp: '2025-10-04T17:22:00Z' },
      { role: 'agent', content: 'Tudo bem. Enviarei um acordo com entrada reduzida e evidências da cobrança.', timestamp: '2025-10-04T17:23:00Z', tool_used: 'Gerou acordo mínimo', knowledge_extracted: 'Evasivo' }
    ],
    created_at: '2025-10-04T17:20:00Z',
    updated_at: '2025-10-04T17:23:00Z'
  },

  // 10 — Novo contrato
  {
    id: 'c10',
    debtor_id: '10',
    messages: [
      { role: 'agent', content: 'Bem-vindo! Seu primeiro vencimento é 25/10 (R$900). Posso enviar o link de pagamento?', timestamp: '2025-10-02T09:00:00Z' },
      { role: 'user', content: 'Pode mandar por WhatsApp, por favor.', timestamp: '2025-10-02T09:02:00Z' },
      { role: 'agent', content: 'Link enviado. Obrigado e conte comigo 😉', timestamp: '2025-10-02T09:03:00Z', tool_used: 'Gerou boleto', knowledge_extracted: 'Prefere WhatsApp' }
    ],
    created_at: '2025-10-02T09:00:00Z',
    updated_at: '2025-10-02T09:03:00Z'
  }
];

export const initialKnowledgeEntries = [
  // 1 — João
  { id: 'k1', debtor_id: '1', conversation_id: 'c1', category: 'financial', tags: ['unemployment','temporary'], title: 'Situação de Desemprego', content: 'Devedor mencionou estar desempregado no momento. Demonstra boa fé.', confidence_level: 0.85, source: 'ai', status: 'pending', created_at: '2025-10-05T18:50:00Z' },
  { id: 'k2', debtor_id: '1', conversation_id: 'c1', category: 'payment', tags: ['prefers_installments'], title: 'Preferência por Parcelamento', content: 'Aceitou 3x de R$500 iniciando 15/10.', confidence_level: 0.92, source: 'ai', status: 'approved', created_at: '2025-10-05T19:17:00Z' },
  { id: 'k3', debtor_id: '1', category: 'communication', tags: ['night_responder'], title: 'Responde à Noite', content: 'Respostas mais frequentes entre 18:00 e 21:00.', confidence_level: 0.78, source: 'ai', status: 'approved', created_at: '2025-10-05T18:00:00Z' },

  // 2 — Disputa/Evasivo
  { id: 'k4', debtor_id: '2', conversation_id: 'c2', category: 'behavior', tags: ['evasive','ignores_messages'], title: 'Comportamento Evasivo', content: 'Demora a responder e evita fechar acordo.', confidence_level: 0.88, source: 'ai', status: 'approved', created_at: '2025-10-07T15:14:00Z' },
  { id: 'k5', debtor_id: '2', conversation_id: 'c2', category: 'financial', tags: ['disputes_amount'], title: 'Disputa Valores', content: 'Solicitou comprovantes antes de pagar.', confidence_level: 0.72, source: 'ai', status: 'pending', created_at: '2025-10-07T15:14:00Z' },

  // 3 — Organizado
  { id: 'k6', debtor_id: '3', conversation_id: 'c3', category: 'payment', tags: ['pays_mid_month'], title: 'Prefere Pagar no Meio do Mês', content: 'Prometeu quitação 18/10.', confidence_level: 0.86, source: 'ai', status: 'approved', created_at: '2025-10-08T10:06:00Z' },
  { id: 'k7', debtor_id: '3', category: 'communication', tags: ['fast_responder'], title: 'Responde Rápido', content: 'Tempo médio de resposta < 10 minutos.', confidence_level: 0.8, source: 'ai', status: 'approved', created_at: '2025-10-08T10:10:00Z' },

  // 4 — Bom relacionamento
  { id: 'k8', debtor_id: '4', conversation_id: 'c4', category: 'behavior', tags: ['honest','cooperative'], title: 'Bom Relacionamento', content: 'Sempre demonstra boa fé e resolve pendências.', confidence_level: 0.95, source: 'manual', status: 'approved', created_at: '2025-10-01T10:00:00Z' },
  { id: 'k9', debtor_id: '4', conversation_id: 'c4', category: 'payment', tags: ['promise_keeper','prefers_installments'], title: 'Cumpre Promessas', content: 'Histórico de cumprimento de 100% das promessas.', confidence_level: 0.98, source: 'manual', status: 'approved', created_at: '2025-10-01T10:00:00Z' },

  // 5 — Agressivo
  { id: 'k10', debtor_id: '5', conversation_id: 'c5', category: 'communication', tags: ['no_response','aggressive'], title: 'Tom Difícil', content: 'Respostas agressivas; manter tom profissional e registrar tudo.', confidence_level: 0.9, source: 'ai', status: 'approved', created_at: '2025-10-06T09:33:00Z' },

  // 6 — Débito automático
  { id: 'k11', debtor_id: '6', conversation_id: 'c6', category: 'payment', tags: ['autopay','on_time'], title: 'Débito Automático', content: 'Pagamentos processados no vencimento sem intervenção.', confidence_level: 0.96, source: 'ai', status: 'approved', created_at: '2025-10-10T13:11:00Z' },
  { id: 'k12', debtor_id: '6', category: 'behavior', tags: ['reliable'], title: 'Confiável', content: 'Sem histórico de atraso em 90 dias.', confidence_level: 0.93, source: 'ai', status: 'approved', created_at: '2025-10-10T13:12:00Z' },

  // 7 — Misto (aceita entrada)
  { id: 'k13', debtor_id: '7', conversation_id: 'c7', category: 'payment', tags: ['accepts_downpayment'], title: 'Aceita Entrada', content: 'Acordo com sinal de R$490 em 15/10.', confidence_level: 0.84, source: 'ai', status: 'approved', created_at: '2025-10-11T16:06:00Z' },

  // 8 — Premium/organizado
  { id: 'k14', debtor_id: '8', conversation_id: 'c8', category: 'payment', tags: ['prefers_debit'], title: 'Prefere Débito', content: 'Autoriza débito no vencimento.', confidence_level: 0.9, source: 'ai', status: 'approved', created_at: '2025-10-09T08:42:00Z' },

  // 9 — Evasivo crônico
  { id: 'k15', debtor_id: '9', conversation_id: 'c9', category: 'behavior', tags: ['evasive','risk'], title: 'Risco Elevado', content: 'Múltiplos atrasos consecutivos desde maio.', confidence_level: 0.91, source: 'ai', status: 'approved', created_at: '2025-10-04T17:23:00Z' },

  // 10 — Novo contrato
  { id: 'k16', debtor_id: '10', conversation_id: 'c10', category: 'communication', tags: ['prefers_whatsapp','morning_responder'], title: 'Prefere WhatsApp', content: 'Solicitou link por WhatsApp; responde pela manhã.', confidence_level: 0.82, source: 'ai', status: 'approved', created_at: '2025-10-02T09:03:00Z' },

  // Extras de contexto comportamental
  { id: 'k17', debtor_id: '2', category: 'communication', tags: ['needs_evidence'], title: 'Requer Evidências', content: 'Somente avança após receber comprovantes de cálculo.', confidence_level: 0.76, source: 'ai', status: 'pending', created_at: '2025-10-07T15:14:30Z' },
  { id: 'k18', debtor_id: '3', category: 'behavior', tags: ['polite'], title: 'Cortês', content: 'Comunicação cordial, facilita negociação.', confidence_level: 0.8, source: 'ai', status: 'approved', created_at: '2025-10-08T10:10:30Z' },
  { id: 'k19', debtor_id: '5', category: 'financial', tags: ['requests_discount'], title: 'Pede Desconto', content: 'Aceita quitação à vista com desconto.', confidence_level: 0.7, source: 'ai', status: 'pending', created_at: '2025-10-06T09:35:00Z' },
  { id: 'k20', debtor_id: '7', category: 'communication', tags: ['evening_responder'], title: 'Responde à Tarde/Noite', content: 'Maior atividade após 16h.', confidence_level: 0.77, source: 'ai', status: 'approved', created_at: '2025-10-11T16:10:00Z' }
];

export const initialPromisesToPay = [
  // 1 — João: 3x de 500 sobre a parcela de 05/10 (i3)
  { id: 'p1', debtor_id: '1', installment_id: 'i3', amount_promised: 500, promised_datetime: '2025-10-15T00:00:00Z', fulfilled: false, observation: '1/3 do acordo de R$1.500 (sobre 05/10 + ajuste). Enviar 2ª e 3ª em 15/11 e 15/12.', created_at: '2025-10-05T19:17:00Z' },

  // 2 — Debtor 2: pagamento integral de 05/10 (i10) após envio de comprovantes
  { id: 'p2', debtor_id: '2', installment_id: 'i10', amount_promised: 850, promised_datetime: '2025-10-20T12:00:00Z', fulfilled: false, observation: 'Pagamento condicionado à validação dos valores.', created_at: '2025-10-07T15:14:00Z' },

  // 3 — Debtor 3: quitação integral de 01/10 (i13)
  { id: 'p3', debtor_id: '3', installment_id: 'i13', amount_promised: 1200, promised_datetime: '2025-10-18T09:00:00Z', fulfilled: false, observation: 'Pagamento integral no meio do mês.', created_at: '2025-10-08T10:06:00Z' },

  // 4 — Debtor 4: 3x de 320 sobre 03/10 (i19)
  { id: 'p4', debtor_id: '4', installment_id: 'i19', amount_promised: 320, promised_datetime: '2025-10-15T00:00:00Z', fulfilled: false, observation: 'Primeira parcela de 3x R$320', created_at: '2025-10-09T14:20:00Z' },

  // 5 — Debtor 5: entrada simbólica para destravar acordo
  { id: 'p5', debtor_id: '5', installment_id: 'i24', amount_promised: 600, promised_datetime: '2025-10-13T14:00:00Z', fulfilled: false, observation: 'Entrada para liberar desconto de 10% no saldo.', created_at: '2025-10-06T09:34:00Z' },

  // 6 — Debtor 7: sinal de R$490 (faturar saldo depois)
  { id: 'p6', debtor_id: '7', installment_id: 'i30', amount_promised: 490, promised_datetime: '2025-10-15T10:00:00Z', fulfilled: false, observation: 'Entrada + reprogramação das demais.', created_at: '2025-10-11T16:06:00Z' },

  // 7 — Debtor 8: débito programado (não é “promessa”, mas útil para funil)
  { id: 'p7', debtor_id: '8', installment_id: 'i37', amount_promised: 1400, promised_datetime: '2025-10-15T06:00:00Z', fulfilled: false, observation: 'Débito agendado pelo banco.', created_at: '2025-10-09T08:42:00Z' },

  // 8 — Debtor 10: primeiro pagamento do contrato
  { id: 'p8', debtor_id: '10', installment_id: 'i43', amount_promised: 900, promised_datetime: '2025-10-25T12:00:00Z', fulfilled: false, observation: 'Primeiro vencimento do contrato novo.', created_at: '2025-10-02T09:03:00Z' }
];
