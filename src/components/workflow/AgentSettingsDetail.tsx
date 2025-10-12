import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const AgentSettingsDetail = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurações do Agente</DialogTitle>
          <DialogDescription>
            Configure os parâmetros do agente de cobrança.
          </DialogDescription>
        </DialogHeader>
        {/* Place your configuration form here */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            (Componentes de configuração do agente vão aqui)
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};