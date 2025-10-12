import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Copy, Trash2 } from 'lucide-react';
import { Node } from 'reactflow';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CollectionNodeConfigProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
}

export const CollectionNodeConfig = ({
  selectedNode,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: CollectionNodeConfigProps) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground px-4">
          <p className="text-sm">👈 Selecione um nó no canvas para configurar</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    onUpdate(selectedNode.id, { ...selectedNode.data, [field]: value });
  };

  const renderNodeConfig = () => {
    switch (selectedNode.type) {
      case 'timelineTrigger':
        return (
          <div className="space-y-4">
            <div>
              <Label>Momento</Label>
              <RadioGroup 
                defaultValue={selectedNode.data.timing || 'before'}
                onValueChange={(value) => handleUpdate('timing', value)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="before" id="before" />
                  <Label htmlFor="before" className="font-normal">Antes do vencimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on" id="on" />
                  <Label htmlFor="on" className="font-normal">No dia do vencimento</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="after" />
                  <Label htmlFor="after" className="font-normal">Após o vencimento</Label>
                </div>
              </RadioGroup>
            </div>

            {selectedNode.data.timing !== 'on' && (
              <div>
                <Label htmlFor="days">Quantos dias?</Label>
                <Input
                  id="days"
                  type="number"
                  value={selectedNode.data.days || 3}
                  onChange={(e) => handleUpdate('days', parseInt(e.target.value))}
                  placeholder="3"
                  className="mt-2"
                  min="1"
                />
              </div>
            )}
          </div>
        );

      case 'cohortFilter':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cohort">Tipo de Cliente</Label>
              <Select 
                defaultValue={selectedNode.data.cohort || 'all'}
                onValueChange={(value) => handleUpdate('cohort', value)}
              >
                <SelectTrigger id="cohort" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novos Clientes</SelectItem>
                  <SelectItem value="good">Bons Pagadores</SelectItem>
                  <SelectItem value="bad">Maus Pagadores</SelectItem>
                  <SelectItem value="recurring">Inadimplentes Recorrentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Este filtro só permite passar clientes do tipo selecionado
            </p>
          </div>
        );

      case 'sendEmail':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email-subject">Assunto do Email</Label>
              <Input
                id="email-subject"
                value={selectedNode.data.subject || ''}
                onChange={(e) => handleUpdate('subject', e.target.value)}
                placeholder="Lembrete: Pagamento próximo do vencimento"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="email-template">Template do Email</Label>
              <Select 
                defaultValue={selectedNode.data.template || 'reminder'}
                onValueChange={(value) => handleUpdate('template', value)}
              >
                <SelectTrigger id="email-template" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Lembrete Amigável</SelectItem>
                  <SelectItem value="urgent">Aviso Urgente</SelectItem>
                  <SelectItem value="final">Último Aviso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email-body">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="email-body"
                value={selectedNode.data.customMessage || ''}
                onChange={(e) => handleUpdate('customMessage', e.target.value)}
                placeholder="Adicione uma mensagem personalizada..."
                className="min-h-[100px] mt-2"
              />
            </div>
          </div>
        );

      case 'sendWhatsApp':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="whatsapp-template">Template da Mensagem</Label>
              <Select 
                defaultValue={selectedNode.data.template || 'reminder'}
                onValueChange={(value) => handleUpdate('template', value)}
              >
                <SelectTrigger id="whatsapp-template" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Lembrete de Pagamento</SelectItem>
                  <SelectItem value="urgent">Aviso de Atraso</SelectItem>
                  <SelectItem value="friendly">Tom Amigável</SelectItem>
                  <SelectItem value="formal">Tom Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="whatsapp-message">Mensagem</Label>
              <Textarea
                id="whatsapp-message"
                value={selectedNode.data.message || ''}
                onChange={(e) => handleUpdate('message', e.target.value)}
                placeholder="Olá! Seu pagamento vence em breve..."
                className="min-h-[100px] mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{{nome}}'}, {'{{valor}}'}, {'{{data}}'} para personalizar
              </p>
            </div>
          </div>
        );

      case 'whatsappAgent':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="agent-tone">Tom do Agente</Label>
              <Select 
                defaultValue={selectedNode.data.tone || 'empathetic'}
                onValueChange={(value) => handleUpdate('tone', value)}
              >
                <SelectTrigger id="agent-tone" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="empathetic">Empático e Compreensivo</SelectItem>
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="firm">Firme mas Respeitoso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="agent-goal">Objetivo da Conversa</Label>
              <Textarea
                id="agent-goal"
                value={selectedNode.data.goal || ''}
                onChange={(e) => handleUpdate('goal', e.target.value)}
                placeholder="Ex: Entender motivo do atraso e oferecer parcelamento..."
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="max-messages">Máximo de Mensagens</Label>
              <Input
                id="max-messages"
                type="number"
                value={selectedNode.data.maxMessages || 10}
                onChange={(e) => handleUpdate('maxMessages', parseInt(e.target.value))}
                className="mt-2"
                min="1"
                max="50"
              />
            </div>
          </div>
        );

      case 'sendPaymentLink':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-provider">Provedor de Pagamento</Label>
              <Select 
                defaultValue={selectedNode.data.provider || 'pix'}
                onValueChange={(value) => handleUpdate('provider', value)}
              >
                <SelectTrigger id="payment-provider" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="credit">Cartão de Crédito</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="all">Todas as opções</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="link-message">Mensagem junto ao link</Label>
              <Textarea
                id="link-message"
                value={selectedNode.data.message || ''}
                onChange={(e) => handleUpdate('message', e.target.value)}
                placeholder="Aqui está seu link de pagamento atualizado..."
                className="min-h-[80px] mt-2"
              />
            </div>
          </div>
        );

      case 'notifyUser':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="notify-reason">Motivo da Notificação</Label>
              <Input
                id="notify-reason"
                value={selectedNode.data.reason || ''}
                onChange={(e) => handleUpdate('reason', e.target.value)}
                placeholder="Ex: Cliente não respondeu após 3 tentativas"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="notify-priority">Prioridade</Label>
              <Select 
                defaultValue={selectedNode.data.priority || 'medium'}
                onValueChange={(value) => handleUpdate('priority', value)}
              >
                <SelectTrigger id="notify-priority" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'wait':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="wait-days">Aguardar quantos dias?</Label>
              <Input
                id="wait-days"
                type="number"
                value={selectedNode.data.days || 1}
                onChange={(e) => handleUpdate('days', parseInt(e.target.value))}
                className="mt-2"
                min="1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O fluxo pausará por este período antes de continuar
            </p>
          </div>
        );

      case 'escalate':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="escalate-reason">Motivo da Escalação</Label>
              <Textarea
                id="escalate-reason"
                value={selectedNode.data.reason || ''}
                onChange={(e) => handleUpdate('reason', e.target.value)}
                placeholder="Ex: Valor superior a R$ 10.000 sem resposta"
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="escalate-dept">Departamento</Label>
              <Select 
                defaultValue={selectedNode.data.department || 'legal'}
                onValueChange={(value) => handleUpdate('department', value)}
              >
                <SelectTrigger id="escalate-dept" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="legal">Jurídico</SelectItem>
                  <SelectItem value="senior">Gerente Sênior</SelectItem>
                  <SelectItem value="collection">Cobrança Especializada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'abTestSplit':
        return (
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💡 Use testes A/B para comparar diferentes estratégias de cobrança e descobrir qual funciona melhor
              </p>
            </div>

            <div>
              <Label htmlFor="test-name">Nome do Teste</Label>
              <Input
                id="test-name"
                value={selectedNode.data.testName || ''}
                onChange={(e) => handleUpdate('testName', e.target.value)}
                placeholder="Ex: Tom Empático vs Tom Firme"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="test-hypothesis">Hipótese</Label>
              <Textarea
                id="test-hypothesis"
                value={selectedNode.data.hypothesis || ''}
                onChange={(e) => handleUpdate('hypothesis', e.target.value)}
                placeholder="Ex: Agentes com tom empático terão maior taxa de sucesso com bons pagadores"
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="split-percentage">Divisão do Tráfego</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Variante A</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedNode.data.splitPercentage || 50}%
                    </span>
                  </div>
                  <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${selectedNode.data.splitPercentage || 50}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">Variante B</span>
                    <span className="text-xs text-muted-foreground">
                      {100 - (selectedNode.data.splitPercentage || 50)}%
                    </span>
                  </div>
                  <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${100 - (selectedNode.data.splitPercentage || 50)}%` }}
                    />
                  </div>
                </div>
              </div>
              <Input
                id="split-percentage"
                type="range"
                value={selectedNode.data.splitPercentage || 50}
                onChange={(e) => handleUpdate('splitPercentage', parseInt(e.target.value))}
                min="10"
                max="90"
                step="5"
                className="mt-3"
              />
            </div>

            <div>
              <Label htmlFor="test-metric">Métrica de Sucesso</Label>
              <Select 
                defaultValue={selectedNode.data.successMetric || 'payment_received'}
                onValueChange={(value) => handleUpdate('successMetric', value)}
              >
                <SelectTrigger id="test-metric" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_received">Pagamentos Recebidos</SelectItem>
                  <SelectItem value="response_rate">Taxa de Resposta</SelectItem>
                  <SelectItem value="time_to_payment">Tempo até Pagamento</SelectItem>
                  <SelectItem value="escalation_rate">Taxa de Escalação (menor é melhor)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test-duration">Duração do Teste (dias)</Label>
              <Input
                id="test-duration"
                type="number"
                value={selectedNode.data.testDuration || 30}
                onChange={(e) => handleUpdate('testDuration', parseInt(e.target.value))}
                className="mt-2"
                min="7"
                max="90"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recomendado: mínimo 30 dias para resultados significativos
              </p>
            </div>

            <div>
              <Label htmlFor="min-sample">Tamanho Mínimo da Amostra</Label>
              <Input
                id="min-sample"
                type="number"
                value={selectedNode.data.minSampleSize || 100}
                onChange={(e) => handleUpdate('minSampleSize', parseInt(e.target.value))}
                className="mt-2"
                min="50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Clientes necessários por variante para conclusão do teste
              </p>
            </div>

            <div>
              <Label htmlFor="test-status">Status do Teste</Label>
              <Select 
                defaultValue={selectedNode.data.testStatus || 'draft'}
                onValueChange={(value) => handleUpdate('testStatus', value)}
              >
                <SelectTrigger id="test-status" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedNode.data.testStatus === 'completed' && (
              <div>
                <Label htmlFor="winner">Variante Vencedora</Label>
                <Select 
                  defaultValue={selectedNode.data.winner || ''}
                  onValueChange={(value) => handleUpdate('winner', value)}
                >
                  <SelectTrigger id="winner" className="mt-2">
                    <SelectValue placeholder="Selecione o vencedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Variante A</SelectItem>
                    <SelectItem value="B">Variante B</SelectItem>
                    <SelectItem value="tie">Empate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            Configurações básicas disponíveis acima.
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{selectedNode.data.label}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Configurações do nó</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator className="mb-4" />

      {/* Scrollable Config Area */}
      <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-2">
        <div>
          <Label htmlFor="node-label">Nome do Nó</Label>
          <Input
            id="node-label"
            value={selectedNode.data.label || ''}
            onChange={(e) => handleUpdate('label', e.target.value)}
            placeholder="Nome do nó"
            className="mt-2"
          />
        </div>

        <Separator />

        {renderNodeConfig()}
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onDuplicate(selectedNode.id)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => {
            onDelete(selectedNode.id);
            onClose();
          }}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
  );
};

