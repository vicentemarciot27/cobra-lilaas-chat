import { useMemo, useState } from 'react';
import { DollarSign, Clock, CheckCircle2, MessageSquare, Mail, Smartphone, Phone, TrendingUp, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Analytics() {
  const { metrics, getMetricsForMonth } = useData();
  const [showMoney, setShowMoney] = useState(true);
  
  // Estado para controlar o mês selecionado para análise
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Por padrão, mostrar outubro (índice 9)
    return { month: 9, year: 2025, label: 'Outubro/2025' };
  });
  
  // Obter métricas para o mês selecionado
  const currentMetrics = useMemo(() => {
    return getMetricsForMonth(selectedMonth.month, selectedMonth.year);
  }, [getMetricsForMonth, selectedMonth.month, selectedMonth.year]);
  
  // Dados para os gráficos
  const funnelData = useMemo(() => {
    const { funnel } = currentMetrics;
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
  }, [currentMetrics]);

  // Performance por canal
  const channelPerformanceData = useMemo(() => {
    return currentMetrics.channelPerformanceData;
  }, [currentMetrics]);




  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground text-lg">Análise de desempenho e resultados das cobranças</p>
        </div>
        
        <div>
          <Select
            value={`${selectedMonth.month},${selectedMonth.year}`}
            onValueChange={(value) => {
              const [month, year] = value.split(',').map(Number);
              const date = new Date(year, month);
              const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              setSelectedMonth({ month, year, label });
            }}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Mês de análise" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9,2025">Outubro/2025</SelectItem>
              <SelectItem value="8,2025">Setembro/2025</SelectItem>
              <SelectItem value="7,2025">Agosto/2025</SelectItem>
              <SelectItem value="6,2025">Julho/2025</SelectItem>
              <SelectItem value="5,2025">Junho/2025</SelectItem>
              <SelectItem value="4,2025">Maio/2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              }).format(currentMetrics.totalRecovered)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMetrics.savings > 0 ? '+' : ''}R$ {currentMetrics.savings.toFixed(0)} vs recuperação manual tradicional
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
              {currentMetrics.avgRecoveryDays} {currentMetrics.avgRecoveryDays === 1 ? 'dia' : 'dias'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              após vencimento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Variação da Taxa de Recuperação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentMetrics.recoveryRateGrowth > 0 ? '+' : ''}{currentMetrics.recoveryRateGrowth?.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMetrics.recoveryRateGrowth > 0 ? '+' : ''}{(currentMetrics.recoveryRateGrowth - (getMetricsForMonth(selectedMonth.month - 1, selectedMonth.year).recoveryRateGrowth || 0))?.toFixed(1)}% comparado ao mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Rate Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {showMoney ? 'Valor Recuperado' : 'Taxa de Recuperação'} ao Longo do Tempo
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoney(!showMoney)}
              className="gap-2"
            >
              {showMoney ? (
                <>
                  <ToggleRight className="h-4 w-4" />
                  <DollarSign className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4" />
                  <TrendingUp className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={currentMetrics.recoveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) =>
                  showMoney
                    ? new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(value)
                    : `${value}%`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string, props: any) => {
                  const data = props.payload;
                  if (showMoney) {
                    const debtors = data?.debtors || [];
                    return [
                      <div className="space-y-1">
                        <div>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(value)}
                        </div>
                        {debtors.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            <div className="font-medium">Pagantes:</div>
                            {debtors.slice(0, 3).map((debtor: string, idx: number) => (
                              <div key={idx}>• {debtor}</div>
                            ))}
                            {debtors.length > 3 && (
                              <div>• ...e mais {debtors.length - 3}</div>
                            )}
                          </div>
                        )}
                      </div>,
                      'Valor Recuperado'
                    ];
                  } else {
                    return [`${value.toFixed(1)}%`, 'Taxa de Recuperação'];
                  }
                }}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={showMoney ? "recovered" : "rate"}
                stroke="hsl(var(--primary))"
                name={showMoney ? "Valor Recuperado" : "Taxa de Recuperação"}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights - Animated */}
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="size-3 rounded-full bg-primary animate-pulse"></div>
              </div>
              <CardTitle>Insights da Lila</CardTitle>
            </div>
            <Badge variant="outline" className="animate-pulse bg-primary/5">
              Analisando dados em tempo real
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-primary/20 shadow-lg shadow-primary/5 animate-in fade-in duration-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {currentMetrics.channelPerformanceData[0]?.channel || 'WhatsApp'} é o canal mais efetivo
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Taxa de resposta de <span className="font-medium text-primary">{currentMetrics.channelPerformanceData[0]?.rate || 0}%</span> no {currentMetrics.channelPerformanceData[0]?.channel || 'WhatsApp'}.
                      <br /> <span className="text-xs text-muted-foreground">Recomendo priorizar este canal.</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 shadow-lg shadow-primary/5 animate-in fade-in duration-700 delay-150">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {currentMetrics.avgRecoveryDays > 0 
                        ? `Recuperação em ${currentMetrics.avgRecoveryDays} dias em média` 
                        : 'Otimize o timing das cobranças'}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {currentMetrics.avgRecoveryDays > 0
                        ? 'Continue usando a Lila para manter esse tempo de resposta.'
                        : 'Configure réguas de cobrança para melhorar a recuperação.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-primary/20 shadow-lg shadow-primary/5 animate-in fade-in duration-700 delay-300">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">
                      {selectedMonth.month === 9
                        ? "Mês em andamento"
                        : "Setembro foi excepcional"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedMonth.month === 9
                        ? "O mês está no início, ainda há muitas cobranças em andamento."
                        : "A Lila conseguiu renegociar muitas dívidas e manter a carteira saudável."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 border border-dashed rounded-lg bg-muted/50 animate-in fade-in duration-700 delay-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Próximo passo recomendado</h4>
                  <p className="text-xs text-muted-foreground">
                    Aumente o uso de {currentMetrics.channelPerformanceData[0]?.channel || 'WhatsApp'} para devedores com histórico de atraso.
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2 animate-pulse"
                onClick={() => toast.info('Funcionalidade em desenvolvimento! Em breve você poderá aplicar recomendações diretamente nos fluxos.')}
              >
                Aplicar aos Fluxos de Cobrança
                <span className="size-2 rounded-full bg-primary"></span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance & Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de resposta por Canal</CardTitle>
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
    </div>
  );
}
