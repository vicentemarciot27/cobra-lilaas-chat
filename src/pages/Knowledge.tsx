import { useState, useMemo } from 'react';
import { TrendingUp, MessageSquare, DollarSign, CheckCircle2, Clock, XCircle, Brain, User, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData, KnowledgeEntry, KnowledgeCategory, KnowledgeStatus } from '@/contexts/DataContext';
import { toast } from 'sonner';

export default function Knowledge() {
  const { knowledgeEntries, debtors, updateKnowledgeEntry, addKnowledgeEntry, approveKnowledge, rejectKnowledge } = useData();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredEntries = useMemo(() => {
    return knowledgeEntries.filter(entry => {
      const matchesSearch = search === '' || 
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      const matchesSource = sourceFilter === 'all' || entry.source === sourceFilter;
      const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
      const matchesPerson = personFilter === 'all' || entry.debtor_id === personFilter;

      return matchesSearch && matchesCategory && matchesSource && matchesStatus && matchesPerson;
    });
  }, [knowledgeEntries, search, categoryFilter, sourceFilter, statusFilter, personFilter]);

  const getCategoryIcon = (category: KnowledgeCategory) => {    
    switch (category) {
      case 'behavior':
        return <TrendingUp className="h-4 w-4" />;
      case 'communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'financial':
        return <DollarSign className="h-4 w-4" />;
      case 'payment':
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: KnowledgeStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Aprovado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Rejeitado</Badge>;
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveKnowledge(id);
      toast.success('Observação aprovada');
    } catch (error) {
      toast.error('Erro ao aprovar observação');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectKnowledge(id);
      toast.success('Observação rejeitada');
    } catch (error) {
      toast.error('Erro ao rejeitar observação');
    }
  };

  const handleSave = async (entry: KnowledgeEntry) => {
    try {
      if (editingEntry) {
        await updateKnowledgeEntry(entry.id, entry);
        toast.success('Observação atualizada');
      } else {
        const { id, created_at, ...entryData } = entry;
        await addKnowledgeEntry(entryData);
        toast.success('Observação criada');
      }
      setEditingEntry(null);
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar observação');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Histórico de Casos</h1>
          <p className="text-muted-foreground text-lg">
            Informações e observações importantes sobre cada devedor
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Observação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Observação</DialogTitle>
            </DialogHeader>
            <KnowledgeForm 
              entry={null}
              debtors={debtors}
              onSave={handleSave}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar observações..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Categorias</SelectItem>
                <SelectItem value="behavior">Comportamento</SelectItem>
                <SelectItem value="communication">Comunicação</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="payment">Pagamento</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Fontes</SelectItem>
                <SelectItem value="ai">Automática</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={personFilter} onValueChange={setPersonFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Devedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Devedores</SelectItem>
                {debtors.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.cpf})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.map(entry => {
          const debtor = debtors.find(d => d.id === entry.debtor_id);
          return (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <div className="mt-1">
                      {getCategoryIcon(entry.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-1">
                        {debtor?.name}
                        {debtor?.cpf ? (
                          <> • {debtor.cpf.slice(-6)}</>
                        ) : null}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.title}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(entry.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {entry.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {entry.source === 'ai' ? (
                      <>
                        <Brain className="h-3 w-3" />
                        <span>Automática</span>
                      </>
                    ) : (
                      <>
                        <User className="h-3 w-3" />
                        <span>Manual</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {entry.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApprove(entry.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(entry.id)}
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost" onClick={() => setEditingEntry(entry)}>
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Observação</DialogTitle>
                        </DialogHeader>
                        <KnowledgeForm 
                          entry={entry}
                          debtors={debtors}
                          onSave={handleSave}
                          onCancel={() => setEditingEntry(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nenhuma observação encontrada</p>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Mostrando {filteredEntries.length} de {knowledgeEntries.length} observações
      </p>
    </div>
  );
}

function KnowledgeForm({ 
  entry, 
  debtors, 
  onSave, 
  onCancel 
}: { 
  entry: KnowledgeEntry | null;
  debtors: any[];
  onSave: (entry: KnowledgeEntry) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<KnowledgeEntry>>(
    entry || {
      debtor_id: debtors[0]?.id || '',
      category: 'behavior',
      tags: [],
      title: '',
      content: '',
      confidence_level: 0.5,
      source: 'manual',
      status: 'approved'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as KnowledgeEntry);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Devedor</Label>
        <Select 
          value={formData.debtor_id} 
          onValueChange={(value) => setFormData({...formData, debtor_id: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {debtors.map(d => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.cpf})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Categoria</Label>
        <Select 
          value={formData.category} 
          onValueChange={(value: KnowledgeCategory) => setFormData({...formData, category: value})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="behavior">Comportamento</SelectItem>
            <SelectItem value="communication">Comunicação</SelectItem>
            <SelectItem value="financial">Financeiro</SelectItem>
            <SelectItem value="payment">Pagamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Título</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Conteúdo</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Tags (separadas por vírgula)</Label>
        <Input
          value={formData.tags?.join(', ')}
          onChange={(e) => setFormData({
            ...formData, 
            tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
          })}
          placeholder="honest, cooperative, night_responder"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}
