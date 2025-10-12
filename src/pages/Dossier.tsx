import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Scale, AlertTriangle, Building2, Home, Car, Target, Circle, CheckCircle2, Clock, MessageSquare, Brain, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';

type InvestigationStep = {
  label: string;
  completed: boolean;
};

export default function Dossier() {
  const { debtorId } = useParams<{ debtorId: string }>();
  const { debtors, installments } = useData();
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [investigationComplete, setInvestigationComplete] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfComplete, setPdfComplete] = useState(false);

  const debtor = debtors.find(d => d.id === debtorId);
  const debtorInstallments = installments.filter(i => i.debtor_id === debtorId);
  const overdueInstallments = debtorInstallments.filter(i => i.status === 'overdue');
  const totalOwed = overdueInstallments.reduce((sum, i) => sum + i.value, 0);

  const investigationSteps: InvestigationStep[] = [
    { label: 'Buscando processos judiciais...', completed: false },
    { label: 'Verificando protestos em cartório...', completed: false },
    { label: 'Consultando registros de empresas...', completed: false },
    { label: 'Analisando patrimônio imobiliário...', completed: false },
    { label: 'Cruzando dados de veículos...', completed: false },
    { label: 'Calculando score de risco...', completed: false },
  ];

  const [steps, setSteps] = useState(investigationSteps);

  const handleInvestigate = async () => {
    setIsInvestigating(true);
    setCurrentStep(0);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(i + 1);
      setSteps(prev => prev.map((step, idx) => 
        idx <= i ? { ...step, completed: true } : step
      ));
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsInvestigating(false);
    setInvestigationComplete(true);
  };

  const getRiskScore = () => {
    if (!debtor) return 50;
    switch (debtor.profile) {
      case 'good_payer': return 35;
      case 'bad_payer': return 75;
      case 'new': return 55;
      default: return 50;
    }
  };

  const handleGeneratePdf = async () => {
    setIsPdfGenerating(true);
    setPdfProgress(0);
    setPdfComplete(false);

    const pdfSteps = [
      'Compilando dados do devedor',
      'Anexando logs de conversação',
      'Incluindo resultados da investigação',
      'Formatando documento jurídico',
      'Gerando PDF'
    ];

    for (let i = 0; i < pdfSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setPdfProgress(((i + 1) / pdfSteps.length) * 100);
    }

    setPdfComplete(true);
    setIsPdfGenerating(false);
  };

  const handleDownload = () => {
    toast.success('Dossiê baixado com sucesso');
    setPdfComplete(false);
  };

  const handleEmail = () => {
    toast.success('Dossiê enviado para juridico@empresa.com');
    setPdfComplete(false);
  };

  if (!debtor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Devedor não encontrado</p>
      </div>
    );
  }

  const riskScore = getRiskScore();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Investigação Patrimonial</h1>
          <p className="text-muted-foreground">{debtor.name}</p>
        </div>
      </div>

      {/* Debtor Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Devedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{debtor.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium">{debtor.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{debtor.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{debtor.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Apartamento</p>
                <p className="font-medium">{debtor.apartment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Perfil</p>
                <Badge variant={debtor.profile === 'good_payer' ? 'default' : debtor.profile === 'bad_payer' ? 'destructive' : 'secondary'}>
                  {debtor.profile === 'good_payer' ? 'Bom Pagador' : debtor.profile === 'bad_payer' ? 'Mau Pagador' : 'Novo'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total em Atraso</p>
                <p className="font-medium text-destructive">R$ {totalOwed.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                <p className="font-medium">
                  {new Date(debtor.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Investigação Financeira e Patrimonial</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Powered by Tratum API</p>
            </div>
            {!investigationComplete && !isInvestigating && (
              <Button onClick={handleInvestigate}>
                <Search className="mr-2 h-4 w-4" />
                Investigar Devedor
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!isInvestigating && !investigationComplete && (
            <div className="text-center py-12 space-y-4">
              <Search className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold text-lg">Investigação Completa</h3>
                <p className="text-muted-foreground">
                  Analise processos judiciais, protestos, patrimônio e muito mais
                </p>
              </div>
            </div>
          )}

          {isInvestigating && (
            <div className="space-y-3 py-4">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {step.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                  ) : idx === currentStep ? (
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 animate-pulse" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {investigationComplete && (
            <div className="space-y-6">
              {/* Results Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Processos Judiciais</p>
                      <p className="text-sm text-muted-foreground">Nenhum processo encontrado</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Nenhum
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Protestos em Cartório</p>
                      <p className="text-sm text-muted-foreground">R$800, registrado em 2024</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    1 ativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Empresas</p>
                      <p className="text-sm text-muted-foreground">"Silva Ltda"</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Diretor
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Imóveis</p>
                      <p className="text-sm text-muted-foreground">R$250k valor estimado</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    1 imóvel
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Veículos</p>
                      <p className="text-sm text-muted-foreground">2019 Honda Civic</p>
                    </div>
                  </div>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    1 veículo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Score de Risco</p>
                      <p className="text-sm text-muted-foreground">Risco médio</p>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {riskScore}/100
                  </Badge>
                </div>
              </div>

              {/* Key Findings */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Principais Descobertas</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Patrimônio Estimado: R$280k</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Dívidas Totais: R$12k (protestos)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Alerta: Patrimônio sugere viabilidade de cobrança</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Recomendação:</strong> Oferecer acordo com garantia de bens</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      {investigationComplete && (
        <Card>
          <CardHeader>
            <CardTitle>Linha do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: debtor.created_at, label: 'Cadastro realizado', icon: Circle },
                { date: overdueInstallments[0]?.due_date || debtor.created_at, label: 'Primeiro pagamento em atraso', icon: Clock },
                { date: debtor.updated_at, label: 'Última atualização de dados', icon: CheckCircle2 },
                { date: new Date().toISOString(), label: 'Investigação realizada', icon: Search },
              ].map((event, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <event.icon className="h-5 w-5 text-primary" />
                    {idx < 3 && <div className="w-0.5 h-full bg-border mt-2" />}
                  </div>
                  <div className="pb-8">
                    <p className="font-medium">{event.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button asChild>
          <Link to={`/chat/${debtorId}`}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Iniciar Chat
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/knowledge">
            <Brain className="mr-2 h-4 w-4" />
            Ver Conhecimento
          </Link>
        </Button>
        {investigationComplete && (
          <Button variant="outline" onClick={() => setIsPdfGenerating(true)}>
            <Download className="mr-2 h-4 w-4" />
            Gerar Dossiê PDF
          </Button>
        )}
      </div>

      {/* PDF Generation Dialog */}
      <Dialog open={isPdfGenerating || pdfComplete} onOpenChange={(open) => {
        if (!open) {
          setIsPdfGenerating(false);
          setPdfComplete(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pdfComplete ? 'Dossiê Pronto!' : 'Gerando Dossiê Jurídico...'}
            </DialogTitle>
          </DialogHeader>
          
          {!pdfComplete ? (
            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span>{Math.round(pdfProgress)}%</span>
                </div>
                <Progress value={pdfProgress} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Compilando dados do devedor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Anexando logs de conversação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>Incluindo resultados da investigação</span>
                </div>
                <div className="flex items-center gap-2">
                  {pdfProgress >= 80 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                  )}
                  <span>Formatando documento jurídico</span>
                </div>
                <div className="flex items-center gap-2">
                  {pdfProgress >= 100 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Gerando PDF</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="text-center">
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Seu documento está pronto para download.
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar PDF
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar por Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
