import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Node, Edge } from "reactflow";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  workflow?: {
    nodes: Node[];
    edges: Edge[];
  };
  timestamp: Date;
}

interface BuilderAgentProps {
  onApplyWorkflow: (nodes: Node[], edges: Edge[]) => void;
  currentNodes: Node[];
  currentEdges: Edge[];
}

// Suggested prompts for quick access
const SUGGESTED_PROMPTS = [
  "Deixe mais agressivo cobrando a cada 5 dias"
];

// Mock API function that simulates an AI agent generating workflows
const mockChatAPI = async (message: string, currentWorkflow: { nodes: Node[], edges: Edge[] }): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerMessage = message.toLowerCase();

  // Generate different workflows based on keywords
  
  // Specific aggressive workflow with 5-day intervals
  if (lowerMessage.includes("cada 5 dias") || lowerMessage.includes("a cada 5") || (lowerMessage.includes("d+10") && lowerMessage.includes("d+30"))) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Criei uma régua agressiva com cobrança sistemática:\n- D-3: Lembrete pré-vencimento\n- D+0: Notificação no vencimento\n- D+5: Primeira cobrança pós-vencimento\n- D+10: Segunda cobrança\n- D+15: Terceira cobrança\n- D+20: Quarta cobrança\n- D+25: Quinta cobrança\n- D+30: Escalação judicial\n\nTotal de 8 pontos de contato com cobrança a cada 5 dias após D+10.",
      workflow: {
        nodes: [
          {
            id: "start-1",
            type: "start",
            position: { x: 250, y: 150 },
            data: { label: "Início", description: "Início da régua de cobrança" }
          },
          {
            id: "notification-1",
            type: "sendNotification",
            position: { x: 290, y: 300 },
            data: {
              label: "Lembrete Pré-Vencimento",
              description: "3 dias antes do vencimento",
              dayOffset: -3,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: false,
              timeOfDay: "09:00"
            }
          },
          {
            id: "notification-2",
            type: "sendNotification",
            position: { x: 180, y: 500 },
            data: {
              label: "Vencimento",
              description: "Dia do vencimento",
              dayOffset: 0,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "10:00"
            }
          },
          {
            id: "notification-3",
            type: "sendNotification",
            position: { x: 310, y: 700 },
            data: {
              label: "Cobrança D+5",
              description: "5 dias após vencimento",
              dayOffset: 5,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "09:00"
            }
          },
          {
            id: "notification-4",
            type: "sendNotification",
            position: { x: 190, y: 900 },
            data: {
              label: "Cobrança D+10",
              description: "10 dias após vencimento",
              dayOffset: 10,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "09:00"
            }
          },
          {
            id: "notification-5",
            type: "sendNotification",
            position: { x: 310, y: 1100 },
            data: {
              label: "Cobrança D+15",
              description: "15 dias após vencimento",
              dayOffset: 15,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "14:00"
            }
          },
          {
            id: "notification-6",
            type: "sendNotification",
            position: { x: 190, y: 1300 },
            data: {
              label: "Cobrança D+20",
              description: "20 dias após vencimento",
              dayOffset: 20,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "14:00"
            }
          },
          {
            id: "notification-7",
            type: "sendNotification",
            position: { x: 310, y: 1500 },
            data: {
              label: "Cobrança D+25",
              description: "25 dias após vencimento",
              dayOffset: 25,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "14:00"
            }
          },
          {
            id: "judicial-1",
            type: "judicialEscalation",
            position: { x: 250, y: 1700 },
            data: {
              label: "Escalação Judicial",
              description: "Processo judicial aos 30 dias",
              dayOffset: 30
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "start-1", target: "notification-1" },
          { id: "e2-3", source: "notification-1", target: "notification-2" },
          { id: "e3-4", source: "notification-2", target: "notification-3" },
          { id: "e4-5", source: "notification-3", target: "notification-4" },
          { id: "e5-6", source: "notification-4", target: "notification-5" },
          { id: "e6-7", source: "notification-5", target: "notification-6" },
          { id: "e7-8", source: "notification-6", target: "notification-7" },
          { id: "e8-9", source: "notification-7", target: "judicial-1" }
        ]
      },
      timestamp: new Date()
    };
  }
  
  if (lowerMessage.includes("simples") || lowerMessage.includes("básico") || lowerMessage.includes("rápido")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Criei uma régua simples com 3 lembretes automáticos:\n- D-3: Email/WhatsApp antes do vencimento\n- D+0: Lembrete no dia do vencimento\n- D+7: Notificação ao operador após 7 dias\n\nClique em 'Aplicar Workflow' para usar esta régua.",
      workflow: {
        nodes: [
          {
            id: "start-1",
            type: "start",
            position: { x: 250, y: 50 },
            data: { label: "Início", description: "Ponto de partida da régua" }
          },
          {
            id: "notification-1",
            type: "sendNotification",
            position: { x: 250, y: 200 },
            data: {
              label: "Lembrete Pré-Vencimento",
              description: "3 dias antes do vencimento",
              dayOffset: -3,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: false,
              timeOfDay: "09:00"
            }
          },
          {
            id: "notification-2",
            type: "sendNotification",
            position: { x: 250, y: 350 },
            data: {
              label: "Lembrete Vencimento",
              description: "No dia do vencimento",
              dayOffset: 0,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "10:00"
            }
          },
          {
            id: "notify-1",
            type: "notifyOperator",
            position: { x: 250, y: 520 },
            data: {
              label: "Notificar Operador",
              description: "Após 7 dias sem pagamento",
              dayOffset: 7
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "start-1", target: "notification-1" },
          { id: "e2-3", source: "notification-1", target: "notification-2" },
          { id: "e3-4", source: "notification-2", target: "notify-1" }
        ]
      },
      timestamp: new Date()
    };
  }

  if (lowerMessage.includes("agressiv") || lowerMessage.includes("intensiv") || lowerMessage.includes("mau pagador")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Criei uma régua agressiva para maus pagadores com 5 pontos de contato:\n- D-5: Primeiro aviso\n- D-2: Segundo aviso\n- D+0: Notificação no vencimento\n- D+3: Cobrança intensa\n- D+7: Escalação judicial\n\nEsta régua é ideal para perfis de alto risco.",
      workflow: {
        nodes: [
          {
            id: "start-1",
            type: "start",
            position: { x: 250, y: 50 },
            data: { label: "Início", description: "Início da cobrança" }
          },
          {
            id: "notification-1",
            type: "sendNotification",
            position: { x: 250, y: 200 },
            data: {
              label: "Primeiro Aviso",
              description: "5 dias antes",
              dayOffset: -5,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "08:00"
            }
          },
          {
            id: "notification-2",
            type: "sendNotification",
            position: { x: 250, y: 350 },
            data: {
              label: "Segundo Aviso",
              description: "2 dias antes",
              dayOffset: -2,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "09:00"
            }
          },
          {
            id: "notification-3",
            type: "sendNotification",
            position: { x: 250, y: 500 },
            data: {
              label: "Vencimento",
              description: "Dia do vencimento",
              dayOffset: 0,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "10:00"
            }
          },
          {
            id: "notification-4",
            type: "sendNotification",
            position: { x: 250, y: 650 },
            data: {
              label: "Cobrança Intensa",
              description: "3 dias após vencimento",
              dayOffset: 3,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: true,
              timeOfDay: "14:00"
            }
          },
          {
            id: "judicial-1",
            type: "judicialEscalation",
            position: { x: 250, y: 820 },
            data: {
              label: "Escalação Judicial",
              description: "Processo judicial",
              dayOffset: 7
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "start-1", target: "notification-1" },
          { id: "e2-3", source: "notification-1", target: "notification-2" },
          { id: "e3-4", source: "notification-2", target: "notification-3" },
          { id: "e4-5", source: "notification-3", target: "notification-4" },
          { id: "e5-6", source: "notification-4", target: "judicial-1" }
        ]
      },
      timestamp: new Date()
    };
  }

  if (lowerMessage.includes("suave") || lowerMessage.includes("bom pagador") || lowerMessage.includes("educad")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Criei uma régua suave para bons pagadores:\n- D-3: Lembrete gentil por email\n- D+3: Segundo lembrete educado\n- D+10: Contato com operador para negociação\n\nEsta abordagem mantém o relacionamento positivo com o cliente.",
      workflow: {
        nodes: [
          {
            id: "start-1",
            type: "start",
            position: { x: 250, y: 50 },
            data: { label: "Início", description: "Início da régua" }
          },
          {
            id: "notification-1",
            type: "sendNotification",
            position: { x: 250, y: 200 },
            data: {
              label: "Lembrete Gentil",
              description: "3 dias antes - apenas email",
              dayOffset: -3,
              sendEmail: true,
              sendWhatsApp: false,
              sendSMS: false,
              timeOfDay: "10:00"
            }
          },
          {
            id: "notification-2",
            type: "sendNotification",
            position: { x: 250, y: 350 },
            data: {
              label: "Segundo Lembrete",
              description: "3 dias após vencimento",
              dayOffset: 3,
              sendEmail: true,
              sendWhatsApp: true,
              sendSMS: false,
              timeOfDay: "11:00"
            }
          },
          {
            id: "notify-1",
            type: "notifyOperator",
            position: { x: 250, y: 520 },
            data: {
              label: "Contato para Negociação",
              description: "10 dias - contato pessoal",
              dayOffset: 10
            }
          }
        ],
        edges: [
          { id: "e1-2", source: "start-1", target: "notification-1" },
          { id: "e2-3", source: "notification-1", target: "notification-2" },
          { id: "e3-4", source: "notification-2", target: "notify-1" }
        ]
      },
      timestamp: new Date()
    };
  }

  if (lowerMessage.includes("limpar") || lowerMessage.includes("vazio") || lowerMessage.includes("zero")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      content: "Ok! Vou limpar o workflow para você começar do zero.",
      workflow: {
        nodes: [],
        edges: []
      },
      timestamp: new Date()
    };
  }

  // Default response - suggest what the agent can do
  return {
    id: Date.now().toString(),
    role: "assistant",
    content: `Olá! Sou seu assistente de construção de réguas de cobrança. 🤖\n\nPosso criar workflows automaticamente para você! Experimente pedir:\n\n• "Crie uma régua simples"\n• "Quero uma régua agressiva para maus pagadores"\n• "Faça uma régua suave para bons pagadores"\n• "Limpar workflow"\n\nOu descreva o que você precisa!`,
    timestamp: new Date()
  };
};

export function BuilderAgent({ onApplyWorkflow, currentNodes, currentEdges }: BuilderAgentProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá! 👋 Sou seu assistente inteligente de criação de réguas.\n\nDescreva o tipo de régua que você precisa e eu vou criá-la para você automaticamente!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingWorkflow, setPendingWorkflow] = useState<{ nodes: Node[], edges: Edge[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await mockChatAPI(input, {
        nodes: currentNodes,
        edges: currentEdges
      });

      setMessages(prev => [...prev, response]);
      
      if (response.workflow) {
        setPendingWorkflow(response.workflow);
      }
    } catch (error) {
      toast.error("Erro ao processar mensagem");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyWorkflow = () => {
    if (pendingWorkflow) {
      onApplyWorkflow(pendingWorkflow.nodes, pendingWorkflow.edges);
      setPendingWorkflow(null);
      toast.success("Workflow aplicado com sucesso!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await mockChatAPI(prompt, {
        nodes: currentNodes,
        edges: currentEdges
      });

      setMessages(prev => [...prev, response]);
      
      if (response.workflow) {
        setPendingWorkflow(response.workflow);
      }
    } catch (error) {
      toast.error("Erro ao processar mensagem");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Builder Agent</h3>
            <p className="text-xs text-muted-foreground">Assistente de IA</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Suggested Prompts */}
      {messages.length <= 1 && !isLoading && (
        <div className="p-4 border-b bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">💡 Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-purple-100 hover:text-purple-700 dark:hover:bg-purple-900 dark:hover:text-purple-100 transition-colors text-xs py-1 px-2"
                onClick={() => handleSuggestedPrompt(prompt)}
              >
                {prompt}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card
                className={`max-w-[85%] p-3 ${
                  message.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.workflow && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="opacity-70">
                        {message.workflow.nodes.length} nós • {message.workflow.edges.length} conexões
                      </span>
                      <CheckCircle className="w-4 h-4 opacity-70" />
                    </div>
                  </div>
                )}
                <p className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </Card>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <Card className="max-w-[85%] p-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Gerando workflow...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Pending Workflow Action */}
      {pendingWorkflow && (
        <div className="p-3 border-t bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Workflow pronto!</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPendingWorkflow(null)}
              >
                <XCircle className="w-4 h-4 mr-1" />
                Descartar
              </Button>
              <Button
                size="sm"
                onClick={handleApplyWorkflow}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Aplicar Workflow
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Descreva a régua que você precisa..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  );
}

