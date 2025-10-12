// Mock data defaults for the application

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

export const initialInstallments = [
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

export const initialConversations = [
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

export const initialKnowledgeEntries = [
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

export const initialPromisesToPay = [
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

// Workflow templates definition (moved before initialRulers)
export const getWorkflowTemplates = () => [
  {
    id: 'new',
    name: 'Novo Cliente',
    description: 'Primeira experiência de pagamento',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 400, y: 50 },
        data: { label: 'Início do Fluxo' },
      },
      {
        id: '2',
        type: 'sendNotification',
        position: { x: 400, y: 180 },
        data: { 
          label: 'Primeiro Lembrete',
          dayOffset: -5,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: false,
          timeOfDay: '09:00',
          messageTemplate: 'friendly',
        },
      },
      {
        id: '3',
        type: 'sendNotification',
        position: { x: 400, y: 360 },
        data: { 
          label: 'Segundo Lembrete',
          dayOffset: -3,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          timeOfDay: '10:00',
        },
      },
      {
        id: '4',
        type: 'sendNotification',
        position: { x: 400, y: 540 },
        data: { 
          label: 'No Vencimento',
          dayOffset: 0,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '09:00',
        },
      },
      {
        id: '5',
        type: 'sendNotification',
        position: { x: 400, y: 720 },
        data: { 
          label: 'Cobrança Imediata',
          dayOffset: 1,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '14:00',
          messageTemplate: 'urgent',
        },
      },
      {
        id: '6',
        type: 'sendNotification',
        position: { x: 400, y: 900 },
        data: { 
          label: 'Último Aviso',
          dayOffset: 5,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '10:00',
          messageTemplate: 'urgent',
        },
      },
      {
        id: '7',
        type: 'sendNotification',
        position: { x: 400, y: 1080 },
        data: { 
          label: 'Aviso Final',
          dayOffset: 10,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '09:00',
          messageTemplate: 'final',
        },
      },
      {
        id: '8',
        type: 'sendNotification',
        position: { x: 400, y: 1260 },
        data: { 
          label: 'Pré-Escalação',
          dayOffset: 15,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: false,
          timeOfDay: '14:00',
          messageTemplate: 'final',
        },
      },
      {
        id: '9',
        type: 'notifyOperator',
        position: { x: 400, y: 1440 },
        data: { 
          label: 'Notificar Gerente',
          dayOffset: 20,
          priority: 'high',
          reason: 'Cliente não respondeu após múltiplas tentativas',
        },
      },
      {
        id: '10',
        type: 'noPayment',
        position: { x: 300, y: 1620 },
        data: { 
          label: 'Sem Pagamento',
          notificationMessage: 'Cliente inadimplente após 20 dias',
        },
      },
      {
        id: '11',
        type: 'judicialEscalation',
        position: { x: 500, y: 1620 },
        data: { 
          label: 'Escalação Jurídica',
          minValue: 5000,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
      { id: 'e6-7', source: '6', target: '7' },
      { id: 'e7-8', source: '7', target: '8' },
      { id: 'e8-9', source: '8', target: '9' },
      { id: 'e9-10', source: '9', target: '10' },
      { id: 'e9-11', source: '9', target: '11' },
    ],
  },
  {
    id: 'bad',
    name: 'Mau Pagador',
    description: 'Requer abordagem mais firme',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 400, y: 50 },
        data: { label: 'Início do Fluxo' },
      },
      {
        id: '2',
        type: 'sendNotification',
        position: { x: 400, y: 180 },
        data: { 
          label: 'Primeiro Aviso',
          dayOffset: -7,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          timeOfDay: '09:00',
        },
      },
      {
        id: '3',
        type: 'sendNotification',
        position: { x: 400, y: 360 },
        data: { 
          label: 'Segundo Aviso',
          dayOffset: -3,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '09:00',
        },
      },
      {
        id: '4',
        type: 'sendNotification',
        position: { x: 400, y: 540 },
        data: { 
          label: 'Vencimento',
          dayOffset: 0,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '10:00',
          messageTemplate: 'urgent',
        },
      },
      {
        id: '5',
        type: 'sendNotification',
        position: { x: 400, y: 720 },
        data: { 
          label: 'Último Aviso',
          dayOffset: 7,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: true,
          includePaymentLink: true,
          timeOfDay: '14:00',
          messageTemplate: 'final',
        },
      },
      {
        id: '6',
        type: 'notifyOperator',
        position: { x: 400, y: 900 },
        data: { 
          label: 'Notificar Gerente',
          dayOffset: 15,
          priority: 'high',
          reason: 'Cliente não respondeu após múltiplas tentativas',
        },
      },
      {
        id: '7',
        type: 'judicialEscalation',
        position: { x: 400, y: 1080 },
        data: { 
          label: 'Escalar para Jurídico',
          minValue: 5000,
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
      { id: 'e6-7', source: '6', target: '7' },
    ],
  },
  {
    id: 'good',
    name: 'Bom Pagador',
    description: 'Histórico positivo de pagamentos',
    nodes: [
      {
        id: '1',
        type: 'start',
        position: { x: 400, y: 50 },
        data: { label: 'Início do Fluxo' },
      },
      {
        id: '2',
        type: 'sendNotification',
        position: { x: 400, y: 180 },
        data: { 
          label: 'Lembrete Amigável',
          dayOffset: -3,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: false,
          timeOfDay: '10:00',
          messageTemplate: 'friendly',
        },
      },
      {
        id: '3',
        type: 'sendNotification',
        position: { x: 400, y: 360 },
        data: { 
          label: 'No Vencimento',
          dayOffset: 0,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: false,
          includePaymentLink: true,
          timeOfDay: '09:00',
          messageTemplate: 'friendly',
        },
      },
      {
        id: '4',
        type: 'sendNotification',
        position: { x: 400, y: 540 },
        data: { 
          label: 'Lembrete Gentil',
          dayOffset: 3,
          sendEmail: false,
          sendWhatsApp: true,
          sendSMS: false,
          includePaymentLink: true,
          timeOfDay: '14:00',
          messageTemplate: 'friendly',
        },
      },
      {
        id: '5',
        type: 'sendNotification',
        position: { x: 400, y: 720 },
        data: { 
          label: 'Último Lembrete',
          dayOffset: 7,
          sendEmail: true,
          sendWhatsApp: true,
          sendSMS: false,
          includePaymentLink: true,
          timeOfDay: '10:00',
          messageTemplate: 'formal',
        },
      },
      {
        id: '6',
        type: 'notifyOperator',
        position: { x: 400, y: 900 },
        data: { 
          label: 'Notificar Gerente',
          dayOffset: 10,
          priority: 'medium',
          reason: 'Bom pagador atrasado - verificar se há algum problema',
        },
      },
      {
        id: '7',
        type: 'success',
        position: { x: 400, y: 1080 },
        data: { label: 'Pagamento Recebido' },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5' },
      { id: 'e5-6', source: '5', target: '6' },
      { id: 'e6-7', source: '6', target: '7' },
    ],
  },
];

// Helper function to get template for a profile
const getTemplateForProfile = (profile) => {
  const templates = getWorkflowTemplates();
  if (profile === 'good_payer') {
    return templates.find(t => t.id === 'good');
  }
  if (profile === 'bad_payer') {
    return templates.find(t => t.id === 'bad');
  }
  if (profile === 'new') {
    return templates.find(t => t.id === 'new');
  }
  return null;
};

export const initialRulers = [
  {
    id: 'r1',
    name: 'Régua Bom Pagador',
    profile_target: 'good_payer',
    json_data: {
      workflow: {
        nodes: getTemplateForProfile('good_payer')?.nodes || [],
        edges: getTemplateForProfile('good_payer')?.edges || []
      }
    },
    agent_config: { 
      tone: 'friendly',
      toneDescription: 'Comunicação leve e próxima, usando linguagem acessível e empática. Ideal para construir relacionamento.',
      adaptiveTiming: true,
      negotiationEnabled: true,
      negotiationPolicy: {
        maxDiscount: 15,
        maxInstallments: 6,
        minInstallmentValue: 200,
      },
    },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'r2',
    name: 'Régua Mau Pagador',
    profile_target: 'bad_payer',
    json_data: {
      workflow: {
        nodes: getTemplateForProfile('bad_payer')?.nodes || [],
        edges: getTemplateForProfile('bad_payer')?.edges || []
      }
    },
    agent_config: { 
      tone: 'firm',
      toneDescription: 'Comunicação direta e assertiva, enfatizando consequências e urgência de forma profissional.',
      adaptiveTiming: false,
      negotiationEnabled: false,
      negotiationPolicy: {
        maxDiscount: 5,
        maxInstallments: 3,
        minInstallmentValue: 500,
      },
    },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  },
  {
    id: 'r3',
    name: 'Régua Novo Devedor',
    profile_target: 'new',
    json_data: {
      workflow: {
        nodes: getTemplateForProfile('new')?.nodes || [],
        edges: getTemplateForProfile('new')?.edges || []
      }
    },
    agent_config: { 
      tone: 'friendly',
      toneDescription: 'Comunicação equilibrada e acolhedora, construindo confiança desde o primeiro contato.',
      adaptiveTiming: true,
      negotiationEnabled: true,
      negotiationPolicy: {
        maxDiscount: 10,
        maxInstallments: 4,
        minInstallmentValue: 300,
      },
    },
    is_active: true,
    created_at: '2025-10-01T10:00:00Z'
  }
];

// Timeline events for visualization (mock data for WorkflowsView)
export const getMockEventsForProfile = (profile) => {
  if (profile === 'good_payer') {
    return [
      { dayOffset: -3, label: 'Envio', channels: { email: true, whatsapp: true }, timeOfDay: '10:00' },
      { dayOffset: 0, label: 'No dia do vencimento', channels: { email: true, whatsapp: true, link: true }, timeOfDay: '09:00' },
      { dayOffset: 3, label: 'Depois do vencimento', channels: { whatsapp: true, link: true }, timeOfDay: '14:00' },
    ];
  }
  if (profile === 'bad_payer') {
    return [
      { dayOffset: -7, label: 'Envio', channels: { email: true, whatsapp: true, sms: true }, timeOfDay: '09:00' },
      { dayOffset: -2, label: 'Antes do vencimento', channels: { email: true, whatsapp: true }, timeOfDay: '10:00' },
      { dayOffset: 0, label: 'No dia do vencimento', channels: { email: true, whatsapp: true, link: true }, timeOfDay: '09:00' },
      { dayOffset: 2, label: 'Depois do vencimento', channels: { whatsapp: true, sms: true, link: true }, timeOfDay: '14:00' },
      { dayOffset: 7, label: '', channels: { email: true, whatsapp: true, sms: true }, timeOfDay: '09:00' },
      { dayOffset: 15, label: '', channels: { whatsapp: true }, timeOfDay: '10:00' },
      { dayOffset: 20, label: '', channels: { email: true }, timeOfDay: '09:00' },
      { dayOffset: 30, label: '', channels: { email: true }, timeOfDay: '14:00' },
      { dayOffset: 45, label: '', channels: { whatsapp: true }, timeOfDay: '10:00' },
      { dayOffset: 60, label: '', channels: { email: true }, timeOfDay: '09:00' },
    ];
  }
  // new
  return [
    { dayOffset: -7, label: 'Envio', channels: { email: true, whatsapp: true }, timeOfDay: '09:00' },
    { dayOffset: -2, label: 'Antes do vencimento', channels: { email: true }, timeOfDay: '10:00' },
    { dayOffset: 0, label: 'No dia do vencimento', channels: { email: true, whatsapp: true, link: true }, timeOfDay: '09:00' },
    { dayOffset: 2, label: 'Depois do vencimento', channels: { whatsapp: true, sms: true }, timeOfDay: '14:00' },
    { dayOffset: 7, label: '', channels: { email: true, whatsapp: true }, timeOfDay: '10:00' },
    { dayOffset: 10, label: '', channels: { whatsapp: true }, timeOfDay: '15:00' },
  ];
};

export const getProfileEmoji = (profile) => {
  const map = {
    good_payer: '😊',
    bad_payer: '😐',
    new: '😊',
  };
  return map[profile] || '😊';
};

export const getProfileDescription = (profile) => {
  const map = {
    good_payer: 'Histórico positivo de pagamentos',
    bad_payer: 'Requer abordagem mais firme',
    new: 'Primeira experiência de pagamento',
  };
  return map[profile] || '';
};

