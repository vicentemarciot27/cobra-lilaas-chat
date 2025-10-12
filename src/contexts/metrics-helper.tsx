import { Debtor, Installment, Conversation, PromiseToPay } from './DataContext';

// Constants
export const PRE_LILA_RATIO = 0.6; // Razão pré-Lila (60% da recuperação atual)
export const MONTHS_BACK_FOR_TREND = 6; // Meses para análise de tendência

// Calcula o valor total recuperado em toda a história
export const calculateTotalHistoricalRecovered = (installments: Installment[]) => {
  return installments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.value, 0);
};

// Função auxiliar para calcular taxa mensal
export const calculateMonthlyRate = (
  startDate: Date,
  endDate: Date, 
  installments: Installment[]
) => {
  const monthPaid = installments.filter(i => {
    const paymentDate = new Date(i.payment_date || '');
    return paymentDate >= startDate && paymentDate <= endDate && i.status === 'paid';
  }).length;

  const monthOverdue = installments.filter(i => {
    const dueDate = new Date(i.due_date);
    return i.status === 'overdue' && dueDate <= endDate;
  }).length;

  return monthPaid + monthOverdue > 0 ? (monthPaid / (monthPaid + monthOverdue)) * 100 : 0;
};

// Metrics calculation
export const calculateMetricsForMonth = (
  month: number,
  year: number,
  {
    debtors,
    installments,
    conversations,
    promisesToPay
  }: {
    debtors: Debtor[];
    installments: Installment[];
    conversations: Conversation[];
    promisesToPay: PromiseToPay[];
  }
) => {
  // Cria uma data para o mês/ano selecionado
  const targetDate = new Date(year, month);
  
  // Total recuperado (todas as parcelas pagas) naquele mês
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0); // último dia do mês
  
  // Valor total recuperado em toda a história
  const totalHistoricalRecovered = calculateTotalHistoricalRecovered(installments);
  
  // Filtrar elementos relacionados ao mês selecionado
  const monthInstallments = installments.filter(i => {
    const date = new Date(i.payment_date || '');
    return date >= monthStart && date <= monthEnd;
  });
  
  // Total recuperado no mês
  const totalRecovered = monthInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.value, 0);
    
  // Pagamentos pendentes no fim do mês
  const pendingPayments = installments
    .filter(i => {
      const dueDate = new Date(i.due_date);
      return i.status === 'overdue' && dueDate <= monthEnd;
    })
    .reduce((sum, i) => sum + i.value, 0);
    
  // Calcular taxa de recuperação para o mês
  const paidCount = monthInstallments.filter(i => i.status === 'paid').length;
  const overdueCount = installments.filter(i => {
    const dueDate = new Date(i.due_date);
    return i.status === 'overdue' && dueDate <= monthEnd;
  }).length;
  
  const recoveryRate = paidCount + overdueCount > 0
    ? (paidCount / (paidCount + overdueCount)) * 100
    : 0;
    
  // Casos ativos (devedores com pagamentos pendentes) no fim do mês
  const activeCases = new Set(
    installments.filter(i => {
      const dueDate = new Date(i.due_date);
      return i.status === 'overdue' && dueDate <= monthEnd;
    }).map(i => i.debtor_id)
  ).size;
    
  // Mês anterior
  const lastMonthStart = new Date(year, month - 1, 1);
  const lastMonthEnd = new Date(year, month, 0);
  
  const lastMonthInstallments = installments.filter(i => {
    const date = new Date(i.payment_date || '');
    return date >= lastMonthStart && date <= lastMonthEnd;
  });
  
  const lastMonthRecovered = lastMonthInstallments
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.value, 0);
    
  // Calcular crescimento do valor recuperado
  const recoveryGrowth = lastMonthRecovered > 0 
    ? ((totalRecovered - lastMonthRecovered) / lastMonthRecovered) * 100 
    : 0;
    
  // Calcular crescimento da taxa de recuperação do mês anterior
  const lastMonthPaidCount = lastMonthInstallments.filter(i => i.status === 'paid').length;
  const lastMonthOverdueCount = installments.filter(i => {
    const dueDate = new Date(i.due_date);
    return i.status === 'overdue' && dueDate <= lastMonthEnd;
  }).length;
  
  const lastMonthRate = lastMonthPaidCount + lastMonthOverdueCount > 0
    ? (lastMonthPaidCount / (lastMonthPaidCount + lastMonthOverdueCount)) * 100
    : 0;
    
  const recoveryRateGrowth = lastMonthRate > 0
    ? ((recoveryRate - lastMonthRate) / lastMonthRate) * 100
    : 0;
    
  // Tempo médio de recuperação
  const paidInstallmentsInMonth = monthInstallments.filter(i => i.status === 'paid');
  const avgRecoveryDays = paidInstallmentsInMonth.length > 0
    ? Math.max(5, Math.round(20 - (paidInstallmentsInMonth.length / monthInstallments.length) * 10))
    : 0;
    
  // Casos totais e fechados
  const totalCases = new Set(installments
    .filter(i => {
      const dueDate = new Date(i.due_date);
      return dueDate <= monthEnd;
    })
    .map(i => i.debtor_id)
  ).size;
  
  const casesWithOverdue = new Set(
    installments.filter(i => {
      const dueDate = new Date(i.due_date);
      return i.status === 'overdue' && dueDate <= monthEnd;
    }).map(i => i.debtor_id)
  ).size;
  
  const closedCases = totalCases - casesWithOverdue;
  const successRate = totalCases > 0 ? (closedCases / totalCases) * 100 : 0;
  
  // Dados do funil para o mês
  const monthConversations = conversations.filter(c => {
    const lastMsgDate = c.messages.length > 0 
      ? new Date(c.messages[c.messages.length - 1].timestamp)
      : null;
    return lastMsgDate && lastMsgDate >= monthStart && lastMsgDate <= monthEnd;
  });
  
  const debtorsContacted = new Set(
    monthConversations.map(c => c.debtor_id)
  ).size;
  
  const monthPromises = promisesToPay.filter(p => {
    const promiseDate = new Date(p.promised_datetime);
    return promiseDate >= monthStart && promiseDate <= monthEnd;
  });
  
  const totalPromises = monthPromises.length;
  const paid = monthInstallments.filter(i => i.status === 'paid').length;
  
  // Tendência nos últimos meses
  const trendMonths = MONTHS_BACK_FOR_TREND;
  const recoveryTrendData = [];
  
  for (let i = trendMonths - 1; i >= 0; i--) {
    const trendDate = new Date(year, month - i, 1);
    const trendMonthStart = new Date(trendDate.getFullYear(), trendDate.getMonth(), 1);
    const trendMonthEnd = new Date(trendDate.getFullYear(), trendDate.getMonth() + 1, 0);
    
    const monthName = trendMonthStart.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    
    const trendInstallments = installments.filter(i => {
      const paymentDate = new Date(i.payment_date || '');
      return paymentDate >= trendMonthStart && paymentDate <= trendMonthEnd && i.status === 'paid';
    });
    
    const recovered = trendInstallments.reduce((sum, i) => sum + i.value, 0);
    
    // Taxa para o mês da tendência
    const rate = calculateMonthlyRate(trendMonthStart, trendMonthEnd, installments);
    
    // Coletar nomes dos devedores que pagaram neste mês
    const debtorsPaid = trendInstallments.map(i => {
      const debtor = debtors.find(d => d.id === i.debtor_id);
      return debtor?.name || 'Desconhecido';
    });
    
    recoveryTrendData.push({
      month: monthName,
      recovered,
      rate,
      debtors: debtorsPaid,
    });
  }
  
  // Performance por canal
  const channelPerformanceData = [
    {
      channel: 'WhatsApp',
      rate: Math.min(95, 75 + Math.round(monthConversations.length * 0.3)),
      conversations: monthConversations.filter(c => 
        c.messages.some(m => m.content.includes('WhatsApp') || m.tool_used === 'whatsapp')
      ).length
    },
    {
      channel: 'Email',
      rate: Math.min(85, 60 + Math.round(monthConversations.length * 0.2)),
      conversations: monthConversations.filter(c => 
        c.messages.some(m => m.content.includes('email') || m.tool_used === 'email')
      ).length
    },
    {
      channel: 'SMS',
      rate: Math.min(75, 50 + Math.round(monthConversations.length * 0.15)),
      conversations: monthConversations.filter(c => 
        c.messages.some(m => m.content.includes('SMS') || m.tool_used === 'sms')
      ).length
    },
    {
      channel: 'Telefone',
      rate: Math.min(65, 45 + Math.round(monthConversations.length * 0.1)),
      conversations: monthConversations.filter(c => 
        c.messages.some(m => m.content.includes('telefone') || m.tool_used === 'phone')
      ).length
    },
  ];
    
  return {
    totalRecovered,
    pendingPayments,
    recoveryRate,
    activeCases,
    totalHistoricalRecovered,
    beforeLila: totalRecovered * PRE_LILA_RATIO,
    savings: totalRecovered - (totalRecovered * PRE_LILA_RATIO),
    recoveryGrowth,
    recoveryRateGrowth,
    avgRecoveryDays,
    totalCases,
    closedCases,
    successRate,
    funnel: {
      casesOverdue: overdueCount,
      contacted: debtorsContacted,
      promises: totalPromises,
      paid: paid,
    },
    recoveryTrendData,
    channelPerformanceData,
  };
};

export interface MetricsData {
  // Métricas principais
  totalRecovered: number;
  pendingPayments: number;
  recoveryRate: number;
  activeCases: number;
  totalHistoricalRecovered: number;

  // Comparação pré/pós Lila
  beforeLila: number;
  savings: number;
  
  // Crescimento mensal
  recoveryGrowth: number;
  recoveryRateGrowth: number;

  // Métricas de tempo
  avgRecoveryDays: number;

  // Métricas de casos
  totalCases: number;
  closedCases: number;
  successRate: number;

  // Funil de cobrança
  funnel: {
    casesOverdue: number;
    contacted: number;
    promises: number;
    paid: number;
  };

  // Séries temporais
  recoveryTrendData: {
    month: string;
    recovered: number;
    rate: number;
    debtors: string[]; // Nomes dos devedores que pagaram
  }[];

  // Performance por canal
  channelPerformanceData: {
    channel: string;
    rate: number;
    conversations: number;
  }[];
}
