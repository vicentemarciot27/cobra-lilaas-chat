import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, TrendingUp, TrendingDown, Users, MessageSquare, FileText, Brain, Receipt, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';

export default function Dashboard() {
  const { debtors, installments, conversations } = useData();
  const [search, setSearch] = useState('');
  const [profileFilter, setProfileFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const metrics = useMemo(() => {
    const thisMonth = new Date().getMonth();
    const totalRecovered = installments
      .filter(i => i.status === 'paid' && new Date(i.created_at).getMonth() === thisMonth)
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

    if (debtorInstallments.length === 0) return 'Em dia';
    
    const earliest = debtorInstallments[0];
    const daysOverdue = Math.floor(
      (new Date().getTime() - new Date(earliest.due_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return `${daysOverdue} dias em atraso`;
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

  const getProfileIcon = (profile: string) => {
    switch (profile) {
      case 'good_payer':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'bad_payer':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'new':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return null;
    }
  };

  const getProfileLabel = (profile: string) => {
    switch (profile) {
      case 'good_payer':
        return 'Bom Pagador';
      case 'bad_payer':
        return 'Mau Pagador';
      case 'new':
        return 'Novo';
      default:
        return profile;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua operação de cobrança</p>
      </div>
      {/* Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recuperado</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.totalRecovered)}
            </div>
            <div className="flex items-center text-xs text-success mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +23% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics.pendingPayments)}
            </div>
            <div className="flex items-center text-xs text-destructive mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              {installments.filter(i => i.status === 'overdue').length} parcelas atrasadas
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Recuperação</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recoveryRate.toFixed(1)}%</div>
            <div className="flex items-center text-xs text-primary mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs mês anterior
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Ativos</CardTitle>
            <Users className="h-4 w-4 text-accent-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeCases}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Devedores com pagamentos pendentes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Debtors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devedores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:w-64"
            />
            <Select value={profileFilter} onValueChange={setProfileFilter}>
              <SelectTrigger className="md:w-48">
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
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="overdue">Em Atraso</SelectItem>
                <SelectItem value="current">Em Dia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Último Contato</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDebtors.map(debtor => (
                  <TableRow key={debtor.id}>
                    <TableCell className="font-medium">{debtor.name}</TableCell>
                    <TableCell>{debtor.cpf}</TableCell>
                    <TableCell>{getDebtorStatus(debtor.id)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        {getProfileIcon(debtor.profile)}
                        {getProfileLabel(debtor.profile)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getLastContact(debtor.id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/chat/${debtor.id}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/dossier/${debtor.id}`}>
                            <FileText className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <Link to="/knowledge">
                            <Brain className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <p className="text-sm text-muted-foreground">
            Mostrando {filteredDebtors.length} de {debtors.length} devedores
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
