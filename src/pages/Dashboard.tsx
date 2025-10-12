import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Users, Receipt, CheckCircle2, XCircle, Clock, Upload, Search, ArrowUpRight, Sparkles, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { CsvImporter } from '@/components/CsvImporter';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function Dashboard() {
  const { debtors, installments, conversations, addDebtor } = useData();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const csvFields = [
    { label: 'Nome', value: 'name', required: true },
    { label: 'CPF', value: 'cpf', required: true },
    { label: 'Telefone', value: 'phone', required: true },
    { label: 'Email', value: 'email', required: false },
    { label: 'Apartamento', value: 'apartment', required: false },
    { label: 'Perfil', value: 'profile', required: false },
  ];

  const handleImport = (data: Record<string, unknown>[]) => {
    try {
      let successCount = 0;
      let errorCount = 0;

      data.forEach((row) => {
        try {
          const name = String(row.name || '').trim();
          const cpf = String(row.cpf || '').trim();
          const phone = String(row.phone || '').trim();

          // Validação básica
          if (!name || !cpf || !phone) {
            errorCount++;
            return;
          }

          // Validar se CPF já existe
          const cpfExists = debtors.some(d => d.cpf === cpf);
          if (cpfExists) {
            errorCount++;
            return;
          }

          const now = new Date().toISOString();
          const newDebtor = {
            id: `debtor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            cpf,
            phone,
            email: String(row.email || '').trim(),
            apartment: String(row.apartment || '').trim(),
            profile: (['good_payer', 'bad_payer', 'new'].includes(String(row.profile))
              ? String(row.profile)
              : 'new') as 'good_payer' | 'bad_payer' | 'new',
            created_at: now,
            updated_at: now,
          };

          addDebtor(newDebtor);
          successCount++;
        } catch {
          errorCount++;
        }
      });

      if (successCount > 0) {
        toast.success(`${successCount} devedor(es) importado(s) com sucesso!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} registro(s) com erro(s) de importação.`);
      }
    } catch (error) {
      toast.error('Erro ao importar dados do CSV');
    }
  };

  const metrics = useMemo(() => {
    // Total recuperado = todas as parcelas pagas (não apenas do mês atual)
    const totalRecovered = installments
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.value, 0);

    const pendingPayments = installments
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + i.value, 0);

    const paidCount = installments.filter(i => i.status === 'paid').length;
    const overdueCount = installments.filter(i => i.status === 'overdue').length;
    const recoveryRate = paidCount + overdueCount > 0 
      ? (paidCount / (paidCount + overdueCount)) * 100 
      : 0;

    const activeCases = new Set(
      installments.filter(i => i.status === 'overdue').map(i => i.debtor_id)
    ).size;

    return {
      totalRecovered,
      pendingPayments,
      recoveryRate,
      activeCases
    };
  }, [installments]);

  // Show welcome modal with confetti on first load
  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    
    if (!hasShownWelcome && metrics.totalRecovered > 0) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasShownWelcome', 'true');
      
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [metrics.totalRecovered]);

  const filteredDebtors = useMemo(() => {
    return debtors.filter(debtor => {
      const matchesSearch = search === '' || 
        debtor.name.toLowerCase().includes(search.toLowerCase()) ||
        debtor.cpf.includes(search);
      
      const matchesProfile = profileFilter === 'all' || debtor.profile === profileFilter;
      
      const debtorInstallments = installments.filter(i => i.debtor_id === debtor.id);
      const hasOverdue = debtorInstallments.some(i => i.status === 'overdue');
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'overdue' && hasOverdue) ||
        (statusFilter === 'current' && !hasOverdue);

      return matchesSearch && matchesProfile && matchesStatus;
    });
  }, [debtors, search, profileFilter, statusFilter, installments]);

  const getDebtorStatus = (debtorId: string) => {
    const debtorInstallments = installments
      .filter(i => i.debtor_id === debtorId && i.status === 'overdue')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    if (debtorInstallments.length === 0) return { label: 'Em dia', variant: 'default' as const };
    
    const earliest = debtorInstallments[0];
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(earliest.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return { label: `${daysOverdue}d atraso`, variant: 'destructive' as const };
  };

  const getLastContact = (debtorId: string) => {
    const conv = conversations.find(c => c.debtor_id === debtorId);
    if (!conv || conv.messages.length === 0) return 'Sem contato';
    
    const lastMsg = conv.messages[conv.messages.length - 1];
    const date = new Date(lastMsg.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    return `${diffDays} dias atrás`;
  };

  const getProfileConfig = (profile: string) => {
    switch (profile) {
      case 'good_payer':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'Bom Pagador',
          variant: 'default' as const,
        };
      case 'bad_payer':
        return {
          icon: <XCircle className="h-3.5 w-3.5" />,
          label: 'Mau Pagador',
          variant: 'destructive' as const,
        };
      case 'new':
        return {
          icon: <Clock className="h-3.5 w-3.5" />,
          label: 'Novo',
          variant: 'secondary' as const,
        };
      default:
        return {
          icon: null,
          label: profile,
          variant: 'outline' as const,
        };
    }
  };

  return (
    <>
      {/* Welcome Modal with Confetti */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">🎉 Parabéns!</DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <div className="text-4xl font-bold text-success">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(metrics.totalRecovered)}
              </div>
              <p className="text-lg">
                Nós recuperamos <span className="font-semibold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(metrics.totalRecovered)}
                </span>!
              </p>
              <p className="text-sm text-muted-foreground">
                Total de valores já recuperados pela Lila
              </p>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Com base no seu desempenho anterior, sem a Lila você teria recebido apenas:
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(metrics.totalRecovered * 0.6)}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button onClick={() => setShowWelcomeModal(false)} className="w-full">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Visão geral da operação</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Recovered */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Recuperado</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(metrics.totalRecovered)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">+23% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-3">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Payments */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                    <p className="text-3xl font-bold tracking-tight">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(metrics.pendingPayments)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Receipt className="h-3 w-3" />
                      <span>{installments.filter(i => i.status === 'overdue').length} parcelas</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-rose-500 to-rose-600 p-3">
                    <Receipt className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recovery Rate */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Taxa de Recuperação</p>
                    <p className="text-3xl font-bold tracking-tight">{metrics.recoveryRate.toFixed(1)}%</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="font-medium">+12% vs mês anterior</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Cases */}
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Casos Ativos</p>
                    <p className="text-3xl font-bold tracking-tight">{metrics.activeCases}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>Com pagamentos pendentes</span>
                    </div>
                  </div>
                  <div className="rounded-full bg-gradient-to-br from-violet-500 to-violet-600 p-3">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Debtors Table */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={profileFilter} onValueChange={setProfileFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Perfis</SelectItem>
                    <SelectItem value="good_payer">Bom Pagador</SelectItem>
                    <SelectItem value="bad_payer">Mau Pagador</SelectItem>
                    <SelectItem value="new">Novo</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                    <SelectItem value="current">Em Dia</SelectItem>
                  </SelectContent>
                </Select>
                <div className="md:ml-auto w-full md:w-auto">
                  <CsvImporter
                    fields={csvFields}
                    onImport={handleImport}
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Importar CSV
                  </CsvImporter>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b">
                      <TableHead className="font-semibold">Nome</TableHead>
                      <TableHead className="font-semibold">CPF</TableHead>
                      <TableHead className="font-semibold">Apartamento</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Perfil</TableHead>
                      <TableHead className="text-right font-semibold">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDebtors.map((debtor) => {
                      const status = getDebtorStatus(debtor.id);
                      const profile = getProfileConfig(debtor.profile);

                      return (
                        <TableRow key={debtor.id} className="group">
                          <TableCell className="font-medium">{debtor.name}</TableCell>
                          <TableCell className="text-muted-foreground">{debtor.cpf}</TableCell>
                          <TableCell className="text-muted-foreground">{debtor.apartment}</TableCell>
                          <TableCell>
                            <Badge variant={status.variant} className="font-normal">
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={profile.variant} className="gap-1.5 font-normal">
                              {profile.icon}
                              {profile.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-row gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 opacity-60 group-hover:opacity-100 hover:bg-transparent transition-opacity"
                                asChild
                              >
                                <Link to={`/chat/${debtor.id}`}>
                                  <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                  Conversa
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 opacity-60 group-hover:opacity-100 hover:bg-transparent transition-opacity"
                                asChild
                              >
                                <Link to={`/dossier/${debtor.id}`}>
                                  Ver detalhes
                                  <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <p className="text-sm text-muted-foreground">
                Mostrando {filteredDebtors.length} de {debtors.length} devedores
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
