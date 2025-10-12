import { useState, useMemo, useEffect } from "react";
import { Settings, Bot, Zap, Volume2 } from "lucide-react";
import EnhancedTimelineVisualization from "@/components/workflow/EnhancedTimelineVisualization";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useData, AgentConfig } from "@/contexts/DataContext";
import { getProfileEmoji, getProfileDescription } from "@/data/defaults";
import { AgentSettingsDetail } from "@/components/workflow/AgentSettingsDetail";
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
const getWorkflowColor = (profile: string) => {
  if (profile === 'good_payer') {
    return 'bg-emerald-50/50 border-gray-200';
  }
  if (profile === 'bad_payer') {
    return 'bg-orange-50/50 border-gray-200';
  }
  if (profile === 'new') {
    return 'bg-blue-50/50 border-gray-200';
  }
  return 'bg-gray-100 border-gray-200';
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
  const [showSettings, setShowSettings] = useState(false);

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


  // Generate unique IDs for this specific card
  const toneId = `tone-${cohortId}`;
  const adaptiveTimingId = `adaptive-timing-${cohortId}`;
  const negotiationId = `negotiation-${cohortId}`;

  return (
    <Card className="p-5 border shadow-sm bg-white">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <div className="w-8 rounded-full flex items-center justify-center">
          <Bot className="w-5 text-primary" />
        </div>
        <div className="flex items-start justify-between w-full">
          <div>
            <h3 className="font-semibold text-sm">Configuração da Lila</h3>
            <p className="text-xs text-muted-foreground">{cohortName}</p>
          </div>
          <Button variant="outline" size="icon" className="border-none bg-transparent hover:bg-muted" onClick={(e) => {
            e.stopPropagation();
            setShowSettings(true);
          }}>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </Button>
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
        </div>

        {/* Behavioral Toggles */}

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
      <AgentSettingsDetail 
        open={showSettings} 
        onOpenChange={setShowSettings}
        config={localConfig}
        cohortName={cohortName}
        onSave={(newConfig) => {
          setLocalConfig(newConfig);
          onConfigChange(rulerId, newConfig);
        }}
      />
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
      const workflowColor = getWorkflowColor(ruler.profile_target);

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
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight">Réguas de Cobrança</h1>
        <p className="text-muted-foreground text-lg">
          Configure lembretes automáticos personalizados para cada perfil de devedor
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
                className={`p-6 border shadow-sm ${workflow.color} flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => navigate(`/canvas?ruler=${workflow.rulerId}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{workflow.emoji}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                    <div className="flex items-center ml-2 px-3 py-1 rounded-lg bg-muted border text-sm font-medium text-muted-foreground shadow-sm">
                      <span className="font-semibold text-base text-primary">{workflow.activeCount}</span>
                      <span className="ml-1">{workflow.activeCount === 1 ? "devedor" : "devedores"}</span>
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

