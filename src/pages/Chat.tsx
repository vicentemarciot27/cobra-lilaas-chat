import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useData } from '@/contexts/DataContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Chat() {
  const { debtorId } = useParams<{ debtorId: string }>();
  const { debtors, installments, conversations, knowledgeEntries, addMessage, addKnowledgeEntry } = useData();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const debtor = debtors.find(d => d.id === debtorId);
  const debtorInstallments = installments.filter(i => i.debtor_id === debtorId && i.status === 'overdue');
  const totalDebt = debtorInstallments.reduce((sum, i) => sum + i.value, 0);
  
  let conversation = conversations.find(c => c.debtor_id === debtorId);
  if (!conversation && debtor) {
    conversation = {
      id: `c-${debtorId}`,
      debtor_id: debtorId,
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  const debtorKnowledge = knowledgeEntries.filter(k => k.debtor_id === debtorId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || !debtor) return;

    const userMessage = {
      role: 'user' as const,
      content: input,
      timestamp: new Date().toISOString()
    };

    addMessage(conversation.id, userMessage);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let response = '';
      let toolUsed = '';
      let knowledgeExtracted = '';

      const lowerInput = input.toLowerCase();

      if (lowerInput.includes('desemprego') || lowerInput.includes('desempregado')) {
        response = 'Entendo sua situação. Que tal parcelarmos o valor em prestações menores para facilitar? Posso oferecer condições especiais.';
        knowledgeExtracted = 'Situação de desemprego';
        
        addKnowledgeEntry({
          id: `k-${Date.now()}`,
          debtor_id: debtorId!,
          conversation_id: conversation.id,
          category: 'financial',
          tags: ['unemployment', 'temporary'],
          title: 'Situação de Desemprego Identificada',
          content: 'Devedor mencionou estar desempregado. Sugere necessidade de condições flexíveis.',
          confidence_level: 0.88,
          source: 'ai',
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } else if (lowerInput.includes('parcelar') || lowerInput.includes('parcelas')) {
        response = `Perfeito! Posso parcelar R$ ${totalDebt.toFixed(2)} em até 3x de R$ ${(totalDebt / 3).toFixed(2)}. Quando você consegue pagar a primeira?`;
        toolUsed = 'Consultou parcelas';
        knowledgeExtracted = 'Preferência por parcelamento';
        
        addKnowledgeEntry({
          id: `k-${Date.now()}`,
          debtor_id: debtorId!,
          conversation_id: conversation.id,
          category: 'payment',
          tags: ['prefers_installments'],
          title: 'Preferência por Parcelamento',
          content: 'Demonstrou interesse em parcelamento. Priorizar ofertas parceladas.',
          confidence_level: 0.92,
          source: 'ai',
          status: 'pending',
          created_at: new Date().toISOString()
        });
      } else if (lowerInput.includes('pagar') || lowerInput.includes('pagamento')) {
        response = 'Ótimo! Vou registrar sua promessa de pagamento. Te envio os detalhes do boleto por aqui. Obrigado pela colaboração!';
        toolUsed = 'Promessa registrada';
      } else if (lowerInput.includes('não posso') || lowerInput.includes('impossível')) {
        response = 'Entendo que está difícil. Vamos encontrar uma solução juntos. Que tal conversarmos sobre suas possibilidades?';
      } else {
        response = 'Entendo. Estou aqui para ajudar a encontrar a melhor solução para você. Como prefere resolver essa pendência?';
      }

      const agentMessage = {
        role: 'agent' as const,
        content: response,
        timestamp: new Date().toISOString(),
        tool_used: toolUsed || undefined,
        knowledge_extracted: knowledgeExtracted || undefined
      };

      addMessage(conversation.id, agentMessage);
      setIsTyping(false);
    }, 1000);
  };

  if (!debtor) {
    return <div className="container mx-auto px-4 py-8">Devedor não encontrado</div>;
  }

  const getProfileBadgeVariant = (profile: string) => {
    switch (profile) {
      case 'good_payer':
        return 'default';
      case 'bad_payer':
        return 'destructive';
      case 'new':
        return 'secondary';
      default:
        return 'outline';
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{debtor.name}</h1>
              <Badge variant={getProfileBadgeVariant(debtor.profile)}>
                {getProfileLabel(debtor.profile)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              CPF: {debtor.cpf} • Total em atraso: R$ {totalDebt.toFixed(2)}
            </p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <Brain className="mr-2 h-4 w-4" />
              Ver Conhecimento
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle>Base de Conhecimento - {debtor.name}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              <div className="space-y-4">
                {debtorKnowledge.map(k => (
                  <Card key={k.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{k.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {k.category}
                          </Badge>
                        </div>
                        <Badge variant={k.status === 'approved' ? 'default' : k.status === 'pending' ? 'secondary' : 'destructive'}>
                          {k.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{k.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {k.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {debtorKnowledge.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum conhecimento extraído ainda
                  </p>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Chat Area */}
      <Card className="h-[600px] flex flex-col">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {conversation?.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'agent' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] space-y-1`}>
                  <div
                    className={`rounded-lg p-4 ${
                      msg.role === 'agent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.tool_used && (
                      <Badge variant="outline" className="text-xs">
                        {msg.tool_used}
                      </Badge>
                    )}
                    {msg.knowledge_extracted && (
                      <Badge variant="outline" className="text-xs">
                        Extraiu: {msg.knowledge_extracted}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-primary text-primary-foreground rounded-lg p-4">
                  <span className="text-sm">Digitando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua mensagem..."
              disabled={isTyping}
            />
            <Button onClick={handleSend} disabled={isTyping || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
