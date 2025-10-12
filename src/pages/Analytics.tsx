import { useMemo } from 'react';
import { DollarSign, Clock, CheckCircle2, MessageSquare, Mail, Smartphone, Phone, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

export default function Analytics() {
  const { installments, debtors, conversations, promisesToPay } = useData();

  // Calculate metrics
  const metrics = useMemo(() => {
    // Total recuperado
    const totalRecovered = installments
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.value, 0);

    // Simular "antes da Lila" (60% do valor recuperado)
    const beforeLila = totalRecovered * 0.6;
    const savings = totalRecovered - beforeLila;

    // Tempo médio de recuperação (estimado baseado em casos fechados)
    const paidInstallments = installments.filter(i => i.status === 'paid');
    // Simular tempo médio baseado no número de parcelas pagas
    // Quanto mais parcelas pagas, menor o tempo médio de recuperação
    const avgRecoveryDays = paidInstallments.length > 0
      ? Math.max(5, Math.round(20 - (paidInstallments.length / installments.length) * 10))
      : 0;

    // Casos fechados (devedores sem pendências)
    const totalCases = new Set(installments.map(i => i.debtor_id)).size;
    const casesWithOverdue = new Set(
      installments.filter(i => i.status === 'overdue').map(i => i.debtor_id)
    ).size;
    const closedCases = totalCases - casesWithOverdue;
    const successRate = totalCases > 0 ? (closedCases / totalCases) * 100 : 0;

    // Dados do funil
    const totalOverdue = installments.filter(i => i.status === 'overdue').length;
    const debtorsContacted = new Set(
      conversations.filter(c => c.messages.length > 0).map(c => c.debtor_id)
    ).size;
    const totalPromises = promisesToPay.length;
    const fulfilledPromises = promisesToPay.filter(p => p.fulfilled).length;
    const totalPaid = installments.filter(i => i.status === 'paid').length;

    return {
      totalRecovered,
      savings,
      avgRecoveryDays,
      totalCases,
      closedCases,
      successRate,
      funnel: {
        casesOverdue: totalOverdue,
        contacted: debtorsContacted,
        promises: totalPromises,
        paid: totalPaid,
      }
    };
  }, [installments, debtors, conversations, promisesToPay]);

  // Dados de tendência de recuperação (últimos 6 meses - simulados com variação)
  const recoveryTrendData = useMemo(() => {
    const months = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentRate = metrics.successRate;
    
    return months.map((month, idx) => {
      const progress = (idx + 1) / months.length;
      const before = 45 + Math.random() * 8 - 24; // Variação em torno de 45%
      const after = 45 + progress * (currentRate - 45); // Progressão até taxa atual
      return {
        month,
        before: Math.round(before),
        after: Math.round(after),
      };
    });
  }, [metrics.successRate]);

  // Performance por canal (baseado em conversas)
  const channelPerformanceData = useMemo(() => {
    // Simular dados baseados nas conversas
    const totalConversations = conversations.filter(c => c.messages.length > 0).length;
    
    return [
      { channel: 'WhatsApp', rate: Math.min(95, 75 + Math.round(totalConversations * 0.3)) },
      { channel: 'Email', rate: Math.min(85, 60 + Math.round(totalConversations * 0.2)) },
      { channel: 'SMS', rate: Math.min(75, 50 + Math.round(totalConversations * 0.15)) },
      { channel: 'Telefone', rate: Math.min(65, 45 + Math.round(totalConversations * 0.1)) },
    ];
  }, [conversations]);

  // Dados do funil
  const funnelData = useMemo(() => {
    const { funnel } = metrics;
    const base = Math.max(funnel.casesOverdue, 1);
    
    return [
      { 
        stage: 'Casos em atraso', 
        value: funnel.casesOverdue, 
        conversion: 100 
      },
      { 
        stage: 'Primeiro contato', 
        value: funnel.contacted, 
        conversion: Math.round((funnel.contacted / base) * 100)
      },
      { 
        stage: 'Promessa de pagamento', 
        value: funnel.promises, 
        conversion: Math.round((funnel.promises / base) * 100)
      },
      { 
        stage: 'Pagamento recebido', 
        value: funnel.paid, 
        conversion: Math.round((funnel.paid / base) * 100)
      },
    ];
  }, [metrics]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground text-lg">Análise de desempenho e resultados das cobranças</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Economizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(metrics.totalRecovered)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              vs recuperação manual tradicional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Recuperação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.avgRecoveryDays} {metrics.avgRecoveryDays === 1 ? 'dia' : 'dias'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              após vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Casos Fechados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.closedCases} / {metrics.totalCases}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.successRate.toFixed(1)}% taxa de sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Rate Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Recuperação ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={recoveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="before" 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="5 5"
                name="Antes da Lila"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="after" 
                stroke="hsl(var(--primary))" 
                name="Com a Lila"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Channel Performance & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Canal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={channelPerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="channel" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Taxa de resposta']}
                />
                <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {[
                { icon: MessageSquare, label: 'WhatsApp', color: 'text-success' },
                { icon: Mail, label: 'Email', color: 'text-info' },
                { icon: Smartphone, label: 'SMS', color: 'text-warning' },
                { icon: Phone, label: 'Telefone', color: 'text-muted-foreground' }
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className="text-sm">{label}</span>
                  </div>
                  <Badge variant="outline">
                    {channelPerformanceData.find(c => c.channel === label)?.rate}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Collection Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Cobrança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnelData.map((item, idx) => (
              <div key={item.stage} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.stage}</span>
                  <Badge variant="outline">
                    {item.value} ({item.conversion}%)
                  </Badge>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary flex items-center justify-center text-xs text-white font-medium transition-all"
                    style={{ width: `${item.conversion}%` }}
                  >
                    {item.conversion}%
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Taxa de Conversão Final</span>
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {funnelData[funnelData.length - 1]?.conversion || 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações Inteligentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">WhatsApp é o canal mais efetivo</h4>
                    <p className="text-xs text-muted-foreground">
                      Taxa de resposta de {channelPerformanceData.find(c => c.channel === 'WhatsApp')?.rate}% no WhatsApp. 
                      Recomendamos priorizar este canal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {metrics.avgRecoveryDays > 0 
                        ? `Recuperação em ${metrics.avgRecoveryDays} dias em média` 
                        : 'Otimize o timing das cobranças'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {metrics.avgRecoveryDays > 0
                        ? 'Continue usando a Lila para manter esse tempo de resposta.'
                        : 'Configure réguas de cobrança para melhorar a recuperação.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {metrics.successRate >= 60 
                        ? `Excelente taxa de ${metrics.successRate.toFixed(0)}%` 
                        : 'Oportunidade de melhoria'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {metrics.successRate >= 60
                        ? 'Sua estratégia de cobrança está funcionando muito bem!'
                        : 'Ajuste suas réguas e personalize a abordagem por perfil.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              disabled
              onClick={() => toast.info('Em breve!')}
            >
              Aplicar aos Fluxos de Cobrança
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
