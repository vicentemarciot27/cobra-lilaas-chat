import { 
  Calendar,
  Mail,
  MessageCircle,
  Link2,
  Bell,
  Bot,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Beaker
} from 'lucide-react';

export interface CollectionNodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'triggers' | 'actions' | 'testing' | 'endings';
  color: string;
}

export const collectionNodeTypes: CollectionNodeType[] = [
  // Triggers
  {
    type: 'timelineTrigger',
    label: 'Gatilho de Timeline',
    description: 'X dias antes/depois do vencimento',
    icon: <Calendar className="w-4 h-4" />,
    category: 'triggers',
    color: 'trigger',
  },
  {
    type: 'cohortFilter',
    label: 'Filtro de Cohort',
    description: 'Novo cliente, bom/mal pagador',
    icon: <Users className="w-4 h-4" />,
    category: 'triggers',
    color: 'trigger',
  },
  
  // Actions
  {
    type: 'sendEmail',
    label: 'Enviar Email',
    description: 'Enviar lembrete por email',
    icon: <Mail className="w-4 h-4" />,
    category: 'actions',
    color: 'email',
  },
  {
    type: 'sendWhatsApp',
    label: 'Enviar WhatsApp',
    description: 'Mensagem automática',
    icon: <MessageCircle className="w-4 h-4" />,
    category: 'actions',
    color: 'whatsapp',
  },
  {
    type: 'whatsappAgent',
    label: 'WhatsApp com Agente IA',
    description: 'Conversa inteligente com cliente',
    icon: <Bot className="w-4 h-4" />,
    category: 'actions',
    color: 'agent',
  },
  {
    type: 'sendPaymentLink',
    label: 'Enviar Link de Pagamento',
    description: 'Link atualizado para pagamento',
    icon: <Link2 className="w-4 h-4" />,
    category: 'actions',
    color: 'payment',
  },
  {
    type: 'notifyUser',
    label: 'Notificar Operador',
    description: 'Aviso para equipe interna',
    icon: <Bell className="w-4 h-4" />,
    category: 'actions',
    color: 'notify',
  },
  {
    type: 'wait',
    label: 'Aguardar',
    description: 'Pausar X dias',
    icon: <Clock className="w-4 h-4" />,
    category: 'actions',
    color: 'wait',
  },
  
  // Testing
  {
    type: 'abTestSplit',
    label: 'Teste A/B',
    description: 'Dividir em 2 variantes para testar',
    icon: <Beaker className="w-4 h-4" />,
    category: 'testing',
    color: 'test',
  },
  
  // Endings
  {
    type: 'successEnd',
    label: 'Sucesso',
    description: 'Pagamento recebido',
    icon: <CheckCircle className="w-4 h-4" />,
    category: 'endings',
    color: 'end',
  },
  {
    type: 'escalate',
    label: 'Escalar para Jurídico',
    description: 'Enviar para cobrança legal',
    icon: <AlertTriangle className="w-4 h-4" />,
    category: 'endings',
    color: 'escalate',
  },
];

interface CollectionNodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const CollectionNodeLibrary = ({ onDragStart }: CollectionNodeLibraryProps) => {
  const categories = {
    triggers: { label: 'Gatilhos', emoji: '⏰', description: 'Quando iniciar a ação' },
    actions: { label: 'Ações', emoji: '📲', description: 'O que fazer' },
    testing: { label: 'Testes', emoji: '🧪', description: 'Experimentar estratégias' },
    endings: { label: 'Finalizações', emoji: '🏁', description: 'Como terminar' },
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h3 className="font-semibold text-lg text-foreground">Componentes</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Arraste para criar seu fluxo de cobrança
        </p>
      </div>
      
      <div className="space-y-6">
        {Object.entries(categories).map(([key, { label, emoji, description }]) => {
          const categoryNodes = collectionNodeTypes.filter(node => node.category === key);
          
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
          💡 <span className="font-medium">Dica:</span> Comece com um gatilho de timeline, adicione ações de comunicação e finalize com sucesso ou escalação.
        </p>
      </div>
    </div>
  );
};

