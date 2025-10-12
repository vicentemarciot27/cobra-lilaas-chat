import { DollarSign, Clock, CheckCircle2, MessageSquare, Mail, Smartphone, Phone, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

const recoveryTrendData = [
  { month: 'Jul', before: 45, after: 48 },
  { month: 'Ago', before: 43, after: 52 },
  { month: 'Set', before: 46, after: 58 },
  { month: 'Out', before: 44, after: 62 },
  { month: 'Nov', before: 47, after: 65 },
  { month: 'Dez', before: 45, after: 67 },
];

const channelPerformanceData = [
  { channel: 'WhatsApp', rate: 78 },
  { channel: 'Email', rate: 62 },
  { channel: 'SMS', rate: 55 },
  { channel: 'Telefone', rate: 48 },
];

const funnelData = [
  { stage: 'Casos em atraso', value: 1000, conversion: 100 },
  { stage: 'Primeiro contato', value: 850, conversion: 85 },
  { stage: 'Promessa de pagar', value: 600, conversion: 60 },
  { stage: 'Pagamento recebido', value: 520, conversion: 52 },
];

export default function Analytics() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Economizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 284.500</div>
            <p className="text-xs text-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              23% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio de Recuperação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 dias</div>
            <p className="text-xs text-info flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              40% mais rápido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Casos Fechados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 / 240</div>
            <p className="text-xs text-muted-foreground mt-1">
              65% taxa de sucesso
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
                name="Antes Lilaas Cobra AI"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="after" 
                stroke="hsl(var(--primary))" 
                name="Com Lilaas Cobra AI"
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
                  fontSize={12}
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
                  <Badge variant="secondary">
                    {item.value} ({item.conversion}%)
                  </Badge>
                </div>
                <div className="h-8 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xs text-white font-medium transition-all"
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
                  52%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights da IA</CardTitle>
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
                      Bons pagadores respondem 82% via WhatsApp vs 58% por email. Recomendamos priorizar este canal.
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
                    <h4 className="font-semibold text-sm">Melhor horário: noite (18:00-21:00)</h4>
                    <p className="text-xs text-muted-foreground">
                      Mensagens enviadas no período noturno têm 3x mais respostas do que pela manhã.
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
                    <h4 className="font-semibold text-sm">Parcelamento aumenta conversão em 45%</h4>
                    <p className="text-xs text-muted-foreground">
                      Ofertas de parcelamento em 3x melhoram drasticamente a taxa de aceitação.
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
