import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AgentConfig } from '@/contexts/DataContext';
import { Separator } from '@/components/ui/separator';

interface AgentSettingsDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AgentConfig;
  cohortName: string;
  onSave: (config: AgentConfig) => void;
}

export const AgentSettingsDetail = ({ 
  open, 
  onOpenChange, 
  config, 
  cohortName, 
  onSave 
}: AgentSettingsDetailProps) => {
  const [localConfig, setLocalConfig] = useState<AgentConfig>(config);

  // Sync local state when config prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    onSave(localConfig);
    onOpenChange(false);
  };

  const getToneLabel = (tone: string) => {
    switch(tone) {
      case 'friendly': return 'Amigável';
      case 'neutral': return 'Neutro';
      case 'formal': return 'Formal';
      case 'firm': return 'Firme';
      default: return tone;
    }
  };

  const getToneDefaultDescription = (tone: string) => {
    switch(tone) {
      case 'friendly': 
        return 'Comunicação leve e próxima, usando linguagem acessível e empática. Ideal para construir relacionamento.';
      case 'neutral': 
        return 'Comunicação equilibrada e profissional, mantendo cordialidade sem ser excessivamente informal.';
      case 'formal': 
        return 'Comunicação respeitosa e protocolar, usando linguagem corporativa e mantendo distância profissional.';
      case 'firm': 
        return 'Comunicação direta e assertiva, enfatizando consequências e urgência de forma profissional.';
      default: 
        return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações Detalhadas da Lila</DialogTitle>
          <DialogDescription>
            Configure como a Lila deve se comportar ao cobrar devedores do perfil <strong>{cohortName}</strong>
          </DialogDescription>
        </DialogHeader> 
        
        <div className="space-y-6 py-4">
          {/* Tone Description */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="tone-description" className="text-sm font-semibold">
                Descrição do Tom de Comunicação
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Tom atual: <span className="font-medium">{getToneLabel(localConfig.tone)}</span>
              </p>
            </div>
            <Textarea
              id="tone-description"
              value={localConfig.toneDescription || getToneDefaultDescription(localConfig.tone)}
              onChange={(e) => setLocalConfig({ ...localConfig, toneDescription: e.target.value })}
              placeholder={getToneDefaultDescription(localConfig.tone)}
              className="min-h-[100px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Descreva como a Lila deve se comunicar com este perfil de cliente. Esta descrição guiará o comportamento das mensagens automáticas.
            </p>
          </div>

          <Separator />

          {/* Negotiation Policy */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Políticas de Negociação</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Defina os limites e parâmetros para negociações automáticas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Max Discount */}
              <div className="space-y-2">
                <Label htmlFor="max-discount" className="text-xs">
                  Desconto Máximo (%)
                </Label>
                <Input
                  id="max-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={localConfig.negotiationPolicy.maxDiscount}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    negotiationPolicy: {
                      ...localConfig.negotiationPolicy,
                      maxDiscount: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Desconto máximo que o agente pode oferecer
                </p>
              </div>

              {/* Max Installments */}
              <div className="space-y-2">
                <Label htmlFor="max-installments" className="text-xs">
                  Máximo de Parcelas
                </Label>
                <Input
                  id="max-installments"
                  type="number"
                  min="1"
                  step="1"
                  value={localConfig.negotiationPolicy.maxInstallments}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    negotiationPolicy: {
                      ...localConfig.negotiationPolicy,
                      maxInstallments: parseInt(e.target.value) || 1
                    }
                  })}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Número máximo de parcelas permitido
                </p>
              </div>

              {/* Min Installment Value */}
              <div className="space-y-2">
                <Label htmlFor="min-installment-value" className="text-xs">
                  Valor Mínimo por Parcela (R$)
                </Label>
                <Input
                  id="min-installment-value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localConfig.negotiationPolicy.minInstallmentValue}
                  onChange={(e) => setLocalConfig({
                    ...localConfig,
                    negotiationPolicy: {
                      ...localConfig.negotiationPolicy,
                      minInstallmentValue: parseFloat(e.target.value) || 0
                    }
                  })}
                  className="h-9"
                />
                <p className="text-xs text-muted-foreground">
                  Valor mínimo aceito por parcela
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar Configurações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};