import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, Users, Receipt, CheckCircle2, XCircle, Clock, Upload, Search, ArrowUpRight, Sparkles, MessageCircle, Calendar, ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { CsvImporter } from '@/components/CsvImporter';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Componente para o cabeçalho ordenável das colunas
interface ColumnHeaderProps {
  title: string;
  onSort: (direction: 'asc' | 'desc') => void;
  activeSortField?: string;
  sortDirection?: 'asc' | 'desc';
  field: string;
}

const SortableColumnHeader: React.FC<ColumnHeaderProps> = ({ 
  title, 
  onSort, 
  activeSortField, 
  sortDirection,
  field 
}) => {
  const isActive = activeSortField === field;
  
  return (
    <div className="flex items-center font-semibold cursor-pointer" onClick={() => {
      onSort(isActive && sortDirection === 'asc' ? 'desc' : 'asc');
    }}>
      <span>{title}</span>
      {isActive ? (
        sortDirection === 'asc' ? (
          <ArrowUp className="ml-1 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-1 h-4 w-4" />
        )
      ) : (
        <ChevronsUpDown className="ml-1 h-4 w-4 opacity-50" />
      )}
    </div>
  );
};

export default function Dashboard() {
  const { debtors, installments, conversations, addDebtor, metrics, getMetricsForMonth } = useData();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Estado para controlar o mês selecionado para análise
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Por padrão, mostrar setembro (índice 9)
    return { month: 8, year: 2025, label: 'Setembro/2025' };
  });
  
  // Obter métricas para o mês selecionado
  const currentMetrics = useMemo(() => {
    return getMetricsForMonth(selectedMonth.month, selectedMonth.year);
  }, [getMetricsForMonth, selectedMonth.month, selectedMonth.year]);
  
  // Função para ordenar as colunas
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const csvFields = [
    { label: 'Nome', value: 'name', required: true },
    { label: 'CPF', value: 'cpf', required: true },
    { label: 'Telefone', value: 'phone', required: true },
    { label: 'Email', value: 'email', required: false },
    { label: 'Imóvel', value: 'apartment', required: false },
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


  // Show welcome modal with confetti on first load
  useEffect(() => {
    const hasShownWelcome = localStorage.getItem('hasShownWelcome');
    
    if (!hasShownWelcome && currentMetrics.totalRecovered > 0) {
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
  }, [currentMetrics.totalRecovered]);

  const filteredDebtors = useMemo(() => {
    // Primeiro filtramos com base nos critérios de busca
    const filtered = debtors
      .filter(debtor => {
        const matchesSearch = search === '' || 
          debtor.name.toLowerCase().includes(search.toLowerCase()) ||
          debtor.cpf.includes(search);
        
        const matchesProfile = profileFilter === 'all' || debtor.profile === profileFilter;
        
        const debtorInstallments = installments.filter(i => i.debtor_id === debtor.id);
        const hasOverdue = debtorInstallments.some(i => i.status === 'overdue');
        const hasRenegotiated = debtorInstallments.some(i => i.status === 'renegotiated');
        const matchesStatus = statusFilter === 'all' || 
          (statusFilter === 'overdue' && hasOverdue) ||
          (statusFilter === 'current' && !hasOverdue && !hasRenegotiated) ||
          (statusFilter === 'renegotiated' && hasRenegotiated);

        return matchesSearch && matchesProfile && matchesStatus;
      });

    // Função de ordenação personalizada
    const getSortValue = (debtor: any, field: string) => {
      // Calculamos valores específicos dependendo do campo
      if (field === 'status') {
        // Status ordena pelo atraso (em dias) da parcela mais antiga em atraso
        const debtorInstallments = installments
          .filter(i => i.debtor_id === debtor.id && i.status === 'overdue')
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
        
        if (debtorInstallments.length === 0) return 0;
        
        const earliest = debtorInstallments[0];
        return Math.floor(
          (new Date().getTime() - new Date(earliest.due_date).getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      
      if (field === 'amount') {
        // Ordenar por valor total devido
        return installments
          .filter(i => i.debtor_id === debtor.id && i.status === 'overdue')
          .reduce((sum, i) => sum + i.value, 0);
      }
      
      if (field === 'profile') {
        // Ordenar por tipo de perfil (prioridade: bad_payer, new, good_payer)
        const profileOrder = { bad_payer: 1, new: 2, good_payer: 3 };
        return profileOrder[debtor.profile] || 999;
      }
      
      // Para outros campos, usamos o valor direto
      return debtor[field];
    };
    
    // Aplicar ordenação se um campo estiver selecionado
    if (sortField) {
      return [...filtered].sort((a, b) => {
        const aValue = getSortValue(a, sortField);
        const bValue = getSortValue(b, sortField);
        
        if (aValue === bValue) {
          // Em caso de valores iguais, Matheus Santoro primeiro
          if (a.name === 'Matheus Santoro') return -1;
          if (b.name === 'Matheus Santoro') return 1;
          
          return 0;
        }
        
        // Ordenação baseada na direção
        const modifier = sortDirection === 'asc' ? 1 : -1;
        
        // Tratamos strings e números de forma diferente
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return modifier * aValue.localeCompare(bValue);
        }
        
        return modifier * (aValue > bValue ? 1 : -1);
      });
    }
    
    // Ordenação padrão quando nenhum campo está selecionado
    return [...filtered].sort((a, b) => {
      // Matheus Santoro sempre no topo quando não há ordenação específica
      if (a.name === 'Matheus Santoro') return -1;
      if (b.name === 'Matheus Santoro') return 1;
      
      // Ordenar por status de atraso depois
      const aInstallments = installments.filter(i => i.debtor_id === a.id);
      const bInstallments = installments.filter(i => i.debtor_id === b.id);
      const aHasOverdue = aInstallments.some(i => i.status === 'overdue');
      const bHasOverdue = bInstallments.some(i => i.status === 'overdue');
      
      if (aHasOverdue && !bHasOverdue) return -1;
      if (!aHasOverdue && bHasOverdue) return 1;
      
      // Depois por valor total devido
      const aTotalDue = aInstallments
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.value, 0);
        
      const bTotalDue = bInstallments
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.value, 0);
        
      if (aTotalDue > bTotalDue) return -1;
      if (aTotalDue < bTotalDue) return 1;
      
      // Por fim, em ordem alfabética
      return a.name.localeCompare(b.name);
    });
  }, [debtors, search, profileFilter, statusFilter, installments, sortField, sortDirection]);

  const getDebtorStatus = (debtorId: string) => {
    // Check if any installment is renegotiated
    const hasRenegotiated = installments.some(i => i.debtor_id === debtorId && i.status === 'renegotiated');
    
    if (hasRenegotiated) {
      return { label: 'Em Renegociação', variant: 'default' as const };
    }
    
    const debtorInstallments = installments
      .filter(i => i.debtor_id === debtorId && i.status === 'overdue')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

    if (debtorInstallments.length === 0) return { label: 'Em dia', variant: 'outline' as const };
    
    const earliest = debtorInstallments[0];
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(earliest.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return { label: `${daysOverdue}d atraso`, variant: 'secondary' as const };
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
          variant: 'outline' as const,
        };
      case 'bad_payer':
        return {
          icon: <XCircle className="h-3.5 w-3.5" />,
          label: 'Mau Pagador',
          variant: 'default' as const,
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
            <DialogDescription className="text-center space-y-6 pt-6">
              <div className="text-5xl font-bold text-success">
                {new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(currentMetrics.totalRecovered)}
              </div>
              <p className="text-xl font-semibold">
                Este mês, recuperamos este valor para você!
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium mb-2">
                🚀 A Lila fez você ganhar <span className="font-bold text-emerald-900">+40% a mais</span> do que você receberia sem ela!
              </p>
              <p className="text-lg font-bold text-emerald-900">
                +{new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(currentMetrics.totalRecovered * 0.4)} extras
              </p>
              <div className="mt-4">
                <p className="text-sm text-emerald-700">
                  Desde que começamos a trabalhar juntos, a Lila já recuperou
                </p>
                <p className="text-xl font-bold text-emerald-900">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(currentMetrics.totalHistoricalRecovered)}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowWelcomeModal(false)} className="w-full">
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">Painel Geral</h1>
              <p className="text-muted-foreground text-lg">Visão geral dos seus devedores e cobranças</p>
            </div>
          </div>
          
          {/* Main Content Grid - Tabela à esquerda, métricas à direita */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Debtors Table - Coluna maior à esquerda */}
            <div className="lg:col-span-4">
              {/* Debtors Table */}
          <Card className="border shadow-sm h-full">
            <CardContent className="p-6 space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Buscar por nome ou CPF..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full"
                  />
                </div>
                <Select value={profileFilter} onValueChange={setProfileFilter}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                    <SelectItem value="current">Em Dia</SelectItem>
                    <SelectItem value="renegotiated">Em Renegociação</SelectItem>
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
                      <TableHead>
                        <SortableColumnHeader 
                          title="Nome" 
                          field="name"
                          onSort={(direction) => {
                            setSortField('name');
                            setSortDirection(direction);
                          }}
                          activeSortField={sortField || ''}
                          sortDirection={sortDirection}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader 
                          title="CPF" 
                          field="cpf"
                          onSort={(direction) => {
                            setSortField('cpf');
                            setSortDirection(direction);
                          }}
                          activeSortField={sortField || ''}
                          sortDirection={sortDirection}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader 
                          title="Imóvel" 
                          field="apartment"
                          onSort={(direction) => {
                            setSortField('apartment');
                            setSortDirection(direction);
                          }}
                          activeSortField={sortField || ''}
                          sortDirection={sortDirection}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader 
                          title="Status" 
                          field="status"
                          onSort={(direction) => {
                            setSortField('status');
                            setSortDirection(direction);
                          }}
                          activeSortField={sortField || ''}
                          sortDirection={sortDirection}
                        />
                      </TableHead>
                      <TableHead>
                        <SortableColumnHeader 
                          title="Perfil" 
                          field="profile"
                          onSort={(direction) => {
                            setSortField('profile');
                            setSortDirection(direction);
                          }}
                          activeSortField={sortField || ''}
                          sortDirection={sortDirection}
                        />
                      </TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDebtors.map((debtor) => {
                      const status = getDebtorStatus(debtor.id);
                      const profile = getProfileConfig(debtor.profile);

                      return (
                        <TableRow key={debtor.id} className="group">
                          <TableCell className="font-medium">{debtor.name}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{debtor.cpf}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{debtor.apartment}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={status.variant} className="font-normal whitespace-nowrap">
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge variant={profile.variant} className="gap-1.5 font-normal whitespace-nowrap">
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

            {/* Métricas à direita */}
            <div className="lg:col-span-1">
              {/* Seletor de Data - Agora visualmente vinculado às métricas */}
              <Card className="border shadow-sm mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Período de Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={`${selectedMonth.month},${selectedMonth.year}`}
                    onValueChange={(value) => {
                      const [month, year] = value.split(',').map(Number);
                      const date = new Date(year, month);
                      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                      setSelectedMonth({ month, year, label });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Mês de análise" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8,2025">Setembro/2025</SelectItem>
                      <SelectItem value="7,2025">Agosto/2025</SelectItem>
                      <SelectItem value="6,2025">Julho/2025</SelectItem>
                      <SelectItem value="5,2025">Junho/2025</SelectItem>
                      <SelectItem value="4,2025">Maio/2025</SelectItem>
                      <SelectItem value="3,2025">Abril/2025</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Metrics Cards - Agora em formato de coluna */}
              <div className="space-y-4">
                {/* Total Recovered */}
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Recuperado</p>
                        <p className="text-2xl font-bold tracking-tight">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(currentMetrics.totalRecovered)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-medium">
                            {currentMetrics.recoveryGrowth > 0 ? '+' : ''}{currentMetrics.recoveryGrowth.toFixed(0)}% vs mês anterior
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 p-3">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Payments */}
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                        <p className="text-2xl font-bold tracking-tight">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(currentMetrics.pendingPayments)}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Receipt className="h-3 w-3" />
                          <span>{currentMetrics.funnel.casesOverdue} parcelas</span>
                        </div>
                      </div>
                      <div className="rounded-full bg-gradient-to-br from-rose-500 to-rose-600 p-3">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recovery Rate */}
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Taxa de Recuperação</p>
                        <p className="text-2xl font-bold tracking-tight">{currentMetrics.recoveryRate.toFixed(1)}%</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-medium">
                            {currentMetrics.recoveryRateGrowth > 0 ? '+' : ''}{currentMetrics.recoveryRateGrowth.toFixed(0)}% vs mês anterior
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Cases */}
                <Card className="border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Casos Ativos</p>
                        <p className="text-2xl font-bold tracking-tight">{currentMetrics.activeCases} devedores</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Com mais de 30 dias de atraso</span>
                        </div>
                      </div>
                      <div className="rounded-full bg-gradient-to-br from-violet-500 to-violet-600 p-3">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
