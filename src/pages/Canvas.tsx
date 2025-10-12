import { Wrench } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Canvas() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Wrench className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Workflow Builder Em Breve</CardTitle>
            <CardDescription className="text-base mt-4">
              Defina sequências automatizadas de cobrança:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Dia 1:</span>
                <span>Lembrete via WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Dia 3:</span>
                <span>Email + SMS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Dia 7:</span>
                <span>Ligação telefônica</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-primary">Dia 15:</span>
                <span>Escalação legal</span>
              </li>
            </ul>
            
            <p className="text-sm text-muted-foreground mt-6">
              Cada perfil de devedor pode ter um workflow customizado com lógica condicional, 
              regras de timing e recomendações geradas por IA.
            </p>

            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                disabled
                onClick={() => toast.info('Em breve!')}
              >
                Ver Exemplo de Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
