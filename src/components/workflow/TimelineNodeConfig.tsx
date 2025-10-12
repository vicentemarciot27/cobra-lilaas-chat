import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { X, Copy, Trash2 } from 'lucide-react';
import { Node } from 'reactflow';

interface TimelineNodeConfigProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
}

export const TimelineNodeConfig = ({
  selectedNode,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: TimelineNodeConfigProps) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground px-4">
          <p className="text-sm">👈 Selecione um nó para configurar</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (field: string, value: any) => {
    onUpdate(selectedNode.id, { ...selectedNode.data, [field]: value });
  };

  const renderNodeConfig = () => {
    switch (selectedNode.type) {
      case 'start':
        return (
          <div className="space-y-4 ml-1">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-xs text-muted-foreground">
                Este é o ponto de início do fluxo de cobrança. Ele será acionado automaticamente quando um pagamento está próximo do vencimento.
              </p>
            </div>
          </div>
        );

      case 'sendNotification':
        return (
          <div className="space-y-4 ml-1">
            <div>
              <Label htmlFor="day-offset">Dia da Timeline</Label>
              <div className="flex items-center gap-2 mt-2">
                <Select 
                  defaultValue={selectedNode.data.dayOffset >= 0 ? 'after' : 'before'}
                  onValueChange={(value) => {
                    const currentOffset = Math.abs(selectedNode.data.dayOffset || 3);
                    handleUpdate('dayOffset', value === 'before' ? -currentOffset : currentOffset);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">D-</SelectItem>
                    <SelectItem value="after">D+</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="day-offset"
                  type="number"
                  value={Math.abs(selectedNode.data.dayOffset || 3)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const isNegative = selectedNode.data.dayOffset < 0;
                    handleUpdate('dayOffset', isNegative ? -value : value);
                  }}
                  placeholder="3"
                  className="flex-1"
                  min="0"
                  max="90"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                D-5 = 5 dias antes | D+3 = 3 dias depois do vencimento
              </p>
            </div>

            <Separator />

            <div>
              <Label className="mb-3 block">Canais de Comunicação</Label>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📧 Email</span>
                  </div>
                  <Switch 
                    checked={selectedNode.data.sendEmail ?? true}
                    onCheckedChange={(checked) => handleUpdate('sendEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💬 WhatsApp</span>
                  </div>
                  <Switch 
                    checked={selectedNode.data.sendWhatsApp ?? true}
                    onCheckedChange={(checked) => handleUpdate('sendWhatsApp', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📱 SMS</span>
                  </div>
                  <Switch 
                    checked={selectedNode.data.sendSMS ?? true}
                    onCheckedChange={(checked) => handleUpdate('sendSMS', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="time-of-day">Horário de Envio</Label>
              <Input
                id="time-of-day"
                type="time"
                value={selectedNode.data.timeOfDay || '09:00'}
                onChange={(e) => handleUpdate('timeOfDay', e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Horário em que as notificações serão enviadas
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="include-link">Incluir Link de Pagamento</Label>
                <Switch 
                  id="include-link"
                  checked={selectedNode.data.includePaymentLink ?? false}
                  onCheckedChange={(checked) => handleUpdate('includePaymentLink', checked)}
                />
              </div>

              {selectedNode.data.includePaymentLink && (
                <div>
                  <Label htmlFor="payment-provider">Opções de Pagamento</Label>
                  <Select 
                    defaultValue={selectedNode.data.paymentProvider || 'all'}
                    onValueChange={(value) => handleUpdate('paymentProvider', value)}
                  >
                    <SelectTrigger id="payment-provider" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas (PIX, Boleto, Cartão)</SelectItem>
                      <SelectItem value="pix">Apenas PIX</SelectItem>
                      <SelectItem value="boleto">Apenas Boleto</SelectItem>
                      <SelectItem value="card">Apenas Cartão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <Label htmlFor="message-template">Template da Mensagem</Label>
              <Select 
                defaultValue={selectedNode.data.messageTemplate || 'friendly'}
                onValueChange={(value) => handleUpdate('messageTemplate', value)}
              >
                <SelectTrigger id="message-template" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Amigável</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="final">Último Aviso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-message">Mensagem Personalizada (opcional)</Label>
              <Textarea
                id="custom-message"
                value={selectedNode.data.customMessage || ''}
                onChange={(e) => handleUpdate('customMessage', e.target.value)}
                placeholder="Adicione uma mensagem personalizada..."
                className="min-h-[80px] mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {'{{nome}}'}, {'{{valor}}'}, {'{{data_vencimento}}'} para personalizar
              </p>
            </div>
          </div>
        );

      case 'notifyOperator':
        return (
          <div className="space-y-4 ml-1">
            <div>
              <Label htmlFor="day-offset-operator">Dia da Timeline</Label>
              <div className="flex items-center gap-2 mt-2">
                <Select 
                  defaultValue={selectedNode.data.dayOffset >= 0 ? 'after' : 'before'}
                  onValueChange={(value) => {
                    const currentOffset = Math.abs(selectedNode.data.dayOffset || 7);
                    handleUpdate('dayOffset', value === 'before' ? -currentOffset : currentOffset);
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">D-</SelectItem>
                    <SelectItem value="after">D+</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="day-offset-operator"
                  type="number"
                  value={Math.abs(selectedNode.data.dayOffset || 7)}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    const isNegative = selectedNode.data.dayOffset < 0;
                    handleUpdate('dayOffset', isNegative ? -value : value);
                  }}
                  className="flex-1"
                  min="0"
                  max="90"
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="notify-reason">Motivo da Notificação</Label>
              <Textarea
                id="notify-reason"
                value={selectedNode.data.reason || ''}
                onChange={(e) => handleUpdate('reason', e.target.value)}
                placeholder="Ex: Cliente não respondeu após 3 tentativas"
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <Select 
                defaultValue={selectedNode.data.priority || 'medium'}
                onValueChange={(value) => handleUpdate('priority', value)}
              >
                <SelectTrigger id="priority" className="mt-2">
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

      case 'judicialEscalation':
        return (
          <div className="space-y-4 ml-1">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ⚠️ Esta ação inicia o processo de cobrança judicial. O caso será enviado para o departamento jurídico.
              </p>
            </div>

            <div>
              <Label htmlFor="escalation-criteria">Critério de Escalação</Label>
              <Textarea
                id="escalation-criteria"
                value={selectedNode.data.criteria || ''}
                onChange={(e) => handleUpdate('criteria', e.target.value)}
                placeholder="Ex: Valor acima de R$ 10.000 sem resposta após 30 dias"
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="auto-escalate">Valor Mínimo para Auto-Escalação</Label>
              <Input
                id="auto-escalate"
                type="number"
                value={selectedNode.data.minValue || 5000}
                onChange={(e) => handleUpdate('minValue', parseInt(e.target.value))}
                placeholder="5000"
                className="mt-2"
                min="0"
                step="100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Débitos acima deste valor serão escalados automaticamente
              </p>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="space-y-4 ml-1">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ✅ Nó de conclusão bem-sucedida. O fluxo termina aqui quando o pagamento é recebido.
              </p>
            </div>
          </div>
        );

      case 'noPayment':
        return (
          <div className="space-y-4 ml-1">
            <div className="p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-xs text-muted-foreground">
                ⚠️ Finaliza o fluxo sem escalação jurídica. Apenas notifica o administrador sobre o não-pagamento.
              </p>
            </div>

            <div>
              <Label htmlFor="notification-message">Mensagem de Notificação</Label>
              <Textarea
                id="notification-message"
                value={selectedNode.data.notificationMessage || ''}
                onChange={(e) => handleUpdate('notificationMessage', e.target.value)}
                placeholder="Ex: Cliente não realizou pagamento após todas as tentativas de cobrança"
                className="min-h-[80px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="next-steps">Próximos Passos Sugeridos</Label>
              <Textarea
                id="next-steps"
                value={selectedNode.data.nextSteps || ''}
                onChange={(e) => handleUpdate('nextSteps', e.target.value)}
                placeholder="Ex: Avaliar histórico do cliente antes de decidir sobre escalação"
                className="min-h-[80px] mt-2"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground ml-1">
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
        <div className="ml-1">
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

