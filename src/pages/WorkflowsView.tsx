import { useState, useMemo, useEffect } from "react";
import { Settings, Bot, Zap, Volume2, Target } from "lucide-react";
import EnhancedTimelineVisualization from "@/components/workflow/EnhancedTimelineVisualization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { getProfileEmoji, getProfileDescription } from "@/data/defaults";
import { Tabs } from "@/components/ui/tabs";

interface TimelineEvent {
  dayOffset: number;
  label: string;
  channels: {
    email?: boolean;
    whatsapp?: boolean;
    sms?: boolean;
    link?: boolean;
  };
  timeOfDay?: string;
  nodeType?: string; // For determining icon
}

interface AgentConfig {
  tone: 'friendly' | 'neutral' | 'formal' | 'firm';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  autoEscalate: boolean;
  adaptiveTiming: boolean;
  negotiationEnabled: boolean;
}

interface WorkflowCohort {
  id: string;
  rulerId: string;
  name: string;
  emoji: string;
  description: string;
  activeCount: number;
  color: string;
  events: TimelineEvent[];
  agentConfig: AgentConfig;
}

/**
 * Converts workflow nodes from Canvas to TimelineEvents for visualization
 * Ensures synchronization between Canvas editor and WorkflowsView timeline
 */
const convertNodesToTimelineEvents = (nodes: any[]): TimelineEvent[] => {
  if (!nodes || !Array.isArray(nodes)) return [];

  // Filter only notification nodes that have dayOffset
  const timelineNodes = nodes.filter(node => 
    (node.type === 'sendNotification' || node.type === 'notifyOperator') &&
    node.data?.dayOffset !== undefined
  );

  // Convert to TimelineEvent format
  const events: TimelineEvent[] = timelineNodes.map(node => ({
    dayOffset: node.data.dayOffset,
    label: node.data.label || 'Evento sem título',
    channels: {
      email: node.data.sendEmail || false,
      whatsapp: node.data.sendWhatsApp || false,
      sms: node.data.sendSMS || false,
      link: node.data.includePaymentLink || false,
    },
    timeOfDay: node.data.timeOfDay || '09:00',
    nodeType: node.type,
  }));

  // Sort by dayOffset (chronological order)
  return events.sort((a, b) => a.dayOffset - b.dayOffset);
};

/**
 * Determines workflow color based on profile and priority
 */
const getWorkflowColor = (profile: string, priority: string) => {
  if (profile === 'good_payer') {
    return 'bg-emerald-50 border-emerald-300';
  }
  if (profile === 'bad_payer') {
    if (priority === 'urgent') {
      return 'bg-red-50 border-red-300';
    }
    return 'bg-orange-50 border-orange-300';
  }
  if (profile === 'new') {
    return 'bg-blue-50 border-blue-300';
  }
  return 'bg-gray-100 border-gray-300';
};

const AgentConfigCard = ({ 
  config, 
  cohortName, 
  cohortId, 
  rulerId, 
  onConfigChange 
}: { 
  config: AgentConfig; 
  cohortName: string; 
  cohortId: string; 
  rulerId: string;
  onConfigChange: (rulerId: string, newConfig: AgentConfig) => void;
}) => {
  const [localConfig, setLocalConfig] = useState(config);

  // Sync local state when config prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (key: keyof AgentConfig, value: any) => {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    // Sync with ruler immediately
    onConfigChange(rulerId, newConfig);
  };

  const getToneBadgeColor = (tone: string) => {
    switch(tone) {
      case 'friendly': return 'bg-green-100 text-green-800';
      case 'neutral': return 'bg-blue-100 text-blue-800';
      case 'formal': return 'bg-purple-100 text-purple-800';
      case 'firm': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch(priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate unique IDs for this specific card
  const toneId = `tone-${cohortId}`;
  const priorityId = `priority-${cohortId}`;
  const autoEscalateId = `auto-escalate-${cohortId}`;
  const adaptiveTimingId = `adaptive-timing-${cohortId}`;
  const negotiationId = `negotiation-${cohortId}`;

  return (
    <Card className="p-5 shadow-card border-2 bg-white">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex items-start justify-between w-full">
          <div>
            <h3 className="font-semibold text-sm">Agente IA</h3>
            <p className="text-xs text-muted-foreground">{cohortName}</p>
          </div>
          <Settings className="w-4 h-4 text-muted-foreground mt-0.5 ml-2" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Tone Selection */}
        <div className="space-y-2">
          <Label htmlFor={toneId} className="text-xs flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5" />
            Tom de Comunicação
          </Label>
          <Select value={localConfig.tone} onValueChange={(value: any) => handleConfigChange('tone', value)}>
            <SelectTrigger id={toneId} className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friendly">Amigável</SelectItem>
              <SelectItem value="neutral">Neutro</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="firm">Firme</SelectItem>
            </SelectContent>
          </Select>
          <Badge className={`text-xs ${getToneBadgeColor(localConfig.tone)}`}>
            {localConfig.tone === 'friendly' ? '😊 Empático' : 
             localConfig.tone === 'neutral' ? '😐 Objetivo' :
             localConfig.tone === 'formal' ? '🎩 Profissional' : '💼 Assertivo'}
          </Badge>
        </div>

        {/* Priority Selection */}
        <div className="space-y-2">
          <Label htmlFor={priorityId} className="text-xs flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            Prioridade
          </Label>
          <Select value={localConfig.priority} onValueChange={(value: any) => handleConfigChange('priority', value)}>
            <SelectTrigger id={priorityId} className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="urgent">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Badge className={`text-xs ${getPriorityBadgeColor(localConfig.priority)}`}>
            {localConfig.priority === 'low' ? 'Sem pressa' :
             localConfig.priority === 'medium' ? 'Atenção normal' :
             localConfig.priority === 'high' ? 'Requer atenção' : '🚨 Máxima atenção'}
          </Badge>
        </div>

        {/* Behavioral Toggles */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <Label htmlFor={autoEscalateId} className="text-xs cursor-pointer">
                Auto-escalação
              </Label>
            </div>
            <Switch
              id={autoEscalateId}
              checked={localConfig.autoEscalate}
              onCheckedChange={(checked) => handleConfigChange('autoEscalate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <Label htmlFor={adaptiveTimingId} className="text-xs cursor-pointer">
                Timing adaptativo
              </Label>
            </div>
            <Switch
              id={adaptiveTimingId}
              checked={localConfig.adaptiveTiming}
              onCheckedChange={(checked) => handleConfigChange('adaptiveTiming', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              <Label htmlFor={negotiationId} className="text-xs cursor-pointer">
                Negociação habilitada
              </Label>
            </div>
            <Switch
              id={negotiationId}
              checked={localConfig.negotiationEnabled}
              onCheckedChange={(checked) => handleConfigChange('negotiationEnabled', checked)}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

// Using our enhanced timeline visualization component
const TimelineVisualization = ({ workflow }: { workflow: WorkflowCohort }) => {
  return <EnhancedTimelineVisualization workflow={workflow} />;
};

export default function WorkflowsView() {
  const navigate = useNavigate();
  const { rulers, debtors, updateRuler } = useData();

  // Handle agent config changes and sync with ruler
  const handleAgentConfigChange = (rulerId: string, newConfig: AgentConfig) => {
    // Update the ruler's agent_config in the DataContext
    // This ensures changes are persisted and synchronized across the app
    updateRuler(rulerId, { agent_config: newConfig });
  };

  // Build workflows from rulers
  const workflows = useMemo<WorkflowCohort[]>(() => {
    return rulers.map((ruler) => {
      // Count debtors for this profile
      const activeCount = debtors.filter((d) => d.profile === ruler.profile_target).length;

      // Extract nodes from ruler's workflow data
      const workflowNodes = (ruler.json_data as any)?.workflow?.nodes || [];
      
      // Convert nodes to timeline events
      const timelineEvents = convertNodesToTimelineEvents(workflowNodes);

      // Get agent config and determine color
      const agentConfig = ruler.agent_config as AgentConfig;
      const workflowColor = getWorkflowColor(ruler.profile_target, agentConfig.priority);

      return {
        id: ruler.profile_target,
        rulerId: ruler.id,
        name: ruler.name,
        emoji: getProfileEmoji(ruler.profile_target),
        description: getProfileDescription(ruler.profile_target),
        activeCount,
        color: workflowColor,
        events: timelineEvents,
        agentConfig,
      };
    });
  }, [rulers, debtors]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Régua de Cobrança</h1>
        <p className="text-muted-foreground mt-2">
          Com base em nossa análise de dados, aprendemos e sugerimos o melhor canal de comunicação com datas para lembretes de pagamentos.
        </p>
      </div>

      {/* Main Content */}
          {workflows.map((workflow) => (
            <div key={workflow.id} className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
              {/* Agent Config Card */}
              <AgentConfigCard 
                config={workflow.agentConfig} 
                cohortName={workflow.name} 
                cohortId={workflow.id}
                rulerId={workflow.rulerId}
                onConfigChange={handleAgentConfigChange}
              />

              {/* Timeline Card */}
              <Card 
                className={`p-6 shadow-card border-2 ${workflow.color} flex flex-col justify-center cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => navigate(`/canvas?ruler=${workflow.rulerId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{workflow.emoji}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      <div className="mt-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {workflow.activeCount} {workflow.activeCount === 1 ? 'cliente' : 'clientes'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      navigate(`/canvas?ruler=${workflow.rulerId}`);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>

                <TimelineVisualization workflow={workflow} />
              </Card>
            </div>
          ))}
    </div>
  );
}

