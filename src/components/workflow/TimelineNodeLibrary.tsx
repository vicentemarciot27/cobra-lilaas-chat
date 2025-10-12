import { 
  Play,
  Bell,
  UserX,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export interface TimelineNodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'start' | 'actions' | 'endings';
  color: string;
}

export const timelineNodeTypes: TimelineNodeType[] = [
  // Start
  {
    type: 'start',
    label: 'Início',
    description: 'Ponto de partida do fluxo',
    icon: <Play className="w-4 h-4" />,
    category: 'start',
    color: 'start',
  },
  
  // Actions
  {
    type: 'sendNotification',
    label: 'Enviar Notificação',
    description: 'Email, WhatsApp e/ou SMS',
    icon: <Bell className="w-4 h-4" />,
    category: 'actions',
    color: 'notification',
  },
  {
    type: 'notifyOperator',
    label: 'Notificar Operador',
    description: 'Alertar equipe interna',
    icon: <UserX className="w-4 h-4" />,
    category: 'actions',
    color: 'notify',
  },
  
  // Endings
  {
    type: 'success',
    label: 'Sucesso',
    description: 'Pagamento recebido',
    icon: <CheckCircle className="w-4 h-4" />,
    category: 'endings',
    color: 'success',
  },
  {
    type: 'noPayment',
    label: 'Sem Pagamento',
    description: 'Cliente não pagou - apenas notificar',
    icon: <AlertCircle className="w-4 h-4" />,
    category: 'endings',
    color: 'notify',
  },
  {
    type: 'judicialEscalation',
    label: 'Escalação Jurídica',
    description: 'Enviar para cobrança judicial',
    icon: <AlertTriangle className="w-4 h-4" />,
    category: 'endings',
    color: 'escalate',
  },
];

interface TimelineNodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const TimelineNodeLibrary = ({ onDragStart }: TimelineNodeLibraryProps) => {
  const categories = {
    start: { label: 'Início', emoji: '🚀', description: 'Ponto de partida' },
    actions: { label: 'Ações', emoji: '📲', description: 'Comunicação com cliente' },
    endings: { label: 'Finalizações', emoji: '🏁', description: 'Desfecho do fluxo' },
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Componentes</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para criar sua régua de cobrança
        </p>
      </div>
      
      <div className="space-y-6">
        {Object.entries(categories).map(([key, { label, emoji, description }]) => {
          const categoryNodes = timelineNodeTypes.filter(node => node.category === key);
          
          return (
            <div key={key}>
              <div className="mb-3">
                <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span>{emoji}</span>
                  <span>{label}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
              </div>
              <div className="space-y-2">
                {categoryNodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="p-3 border-2 rounded-lg bg-card hover:bg-accent hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {node.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{node.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{node.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <span className="font-medium">Dica:</span> Configure o dia relativo ao vencimento (D-5, D+3) em cada notificação para criar sua timeline.
        </p>
      </div>

      <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg">
        <p className="text-xs font-medium mb-1">🤖 Agente IA WhatsApp</p>
        <p className="text-xs text-muted-foreground">
          O agente IA está sempre ativo e responde automaticamente todas as conversas no WhatsApp. Configure o comportamento dele na página de Analytics.
        </p>
      </div>
    </div>
  );
};

