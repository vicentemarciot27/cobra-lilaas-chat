import React from 'react';
import {
  IconMail,
  IconMessageCircle,
  IconPhone,
  IconLink,
  IconBell,
  IconUserX,
  IconAlertTriangle,
  IconCircleCheck,
  IconAlertCircle,
  IconClock
} from '@tabler/icons-react';
import { AgentConfig } from '@/contexts/DataContext';

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
  nodeType?: string;
}

interface WorkflowCohort {
  id: string;
  name: string;
  description: string;
  activeCount: number;
  color: string;
  events: TimelineEvent[];
  agentConfig: AgentConfig;
}

interface TimelineVisualizationProps {
  workflow: WorkflowCohort;
}

const EnhancedTimelineVisualization: React.FC<TimelineVisualizationProps> = ({ workflow }) => {
  // Create all possible day markers for the timeline
  const allDays = workflow.events.map(e => e.dayOffset).sort((a, b) => a - b);

  // Determine node color based on day offset (seguindo TimelineNodes.tsx)
  const getNodeColor = (day: number, nodeType?: string) => {
    // Cores específicas para tipos especiais de nós
    if (nodeType === 'judicialEscalation' || nodeType === 'escalate') {
      return {
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-300 dark:border-red-700',
        icon: 'text-red-600 dark:text-red-400',
        handle: 'bg-red-500'
      };
    }
    
    if (nodeType === 'success') {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-300 dark:border-emerald-700',
        icon: 'text-emerald-600 dark:text-emerald-400',
        handle: 'bg-emerald-500'
      };
    }
    
    if (nodeType === 'noPayment') {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
        border: 'border-yellow-300 dark:border-yellow-700',
        icon: 'text-yellow-600 dark:text-yellow-400',
        handle: 'bg-yellow-500'
      };
    }
    
    if (nodeType === 'notifyOperator') {
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-950/30',
        border: 'border-yellow-300 dark:border-yellow-700',
        icon: 'text-yellow-600 dark:text-yellow-400',
        handle: 'bg-yellow-500'
      };
    }

    // Para nós de notificação regulares, base no offset do dia - EXATAMENTE COMO TimelineNodes.tsx
    
    // Antes do vencimento (D-X) - Azul
    if (day <= 0) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-300 dark:border-blue-700',
        icon: 'text-blue-600 dark:text-blue-400',
        handle: 'bg-blue-500'
      };
    }
    
    // Logo após o vencimento (D+1 até D+7) - Âmbar/Amarelo
    if (day > 0 && day <= 7) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-300 dark:border-amber-700',
        icon: 'text-amber-600 dark:text-amber-400',
        handle: 'bg-amber-500'
      };
    }
    
    // Muitos dias depois (D+8+) - Roxo
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-300 dark:border-purple-700',
      icon: 'text-purple-600 dark:text-purple-400',
      handle: 'bg-purple-500'
    };
  };
  
  // Get keyword based on node type
  const getNodeKeyword = (nodeType?: string) => {
    switch (nodeType) {
      case 'sendNotification':
        return 'Lembrete';
      case 'notifyOperator':
        return 'Escalação';
      case 'judicialEscalation':
        return 'Jurídico';
      case 'noPayment':
        return 'Encerrar';
      case 'success':
        return 'Concluído';
      default:
        return 'Aviso';
    }
  };

  // Get main icon based on node type
  const getMainIcon = (nodeType?: string, iconClass?: string) => {
    const size = 16;
    const stroke = 1.5;
    
    switch (nodeType) {
      case 'sendNotification':
        return <IconBell size={size} stroke={stroke} className={iconClass} />;
      case 'notifyOperator':
        return <IconUserX size={size} stroke={stroke} className={iconClass} />;
      case 'judicialEscalation':
        return <IconAlertTriangle size={size} stroke={stroke} className={iconClass} />;
      case 'noPayment':
        return <IconAlertCircle size={size} stroke={stroke} className={iconClass} />;
      case 'success':
        return <IconCircleCheck size={size} stroke={stroke} className={iconClass} />;
      default:
        return <IconBell size={size} stroke={stroke} className={iconClass} />;
    }
  };

  return (
    <div className="relative py-4">
      {/* Timeline container with horizontal scroll */}
      <div className="relative overflow-hidden">
        {/* Scrollable container */}
        <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
          <div style={{ minWidth: 'min-content' }}>
            {/* Simple timeline track */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-border"></div>

            <div className="relative flex gap-2" style={{ minWidth: 'max-content' }}>
              {allDays.map((day, idx) => {
                const event = workflow.events.find(e => e.dayOffset === day);
                const colors = getNodeColor(day, event?.nodeType);
                
                return (
                  <div key={day} className="flex flex-col items-center flex-1 w-full">
                    {/* Day label above timeline */}
                    <div className="text-xs font-semibold text-muted-foreground mb-2 bg-transparent" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                      {day === 0 ? 'D (Vencimento)' : day < 0 ? `D${day}` : `D+${day}`}
                    </div>

                    {/* Day marker dot on the timeline */}
                    <div className="relative mb-3 z-10">
                      <div className={`w-3 h-3 rounded-full ${event ? 'bg-primary' : 'bg-muted border-2 border-border'} transition-all`}>
                      </div>
                    </div>

                    {/* Event card below timeline */}
                    {event && (
                      <div className={`p-2.5 rounded-lg border ${colors.bg} ${colors.border} w-full h-full flex flex-col justify-between`}>
                        {/* Keyword label */}
                        <div className="flex justify-center mb-1.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5">
                            {getNodeKeyword(event.nodeType)}
                          </span>
                        </div>
                        
                        {/* Main icon and Time of day */}
                        {event.timeOfDay && (
                          <div className="flex items-center justify-center gap-1.5 mb-2">
                            {getMainIcon(event.nodeType, colors.icon)}
                            <span className="text-xs font-medium text-foreground">{event.timeOfDay}</span>
                          </div>
                        )}
                        
                        {/* Channel icons inline */}
                        <div className="flex gap-1 justify-center items-center mt-auto">
                          {event.channels.email && (
                            <div className="flex items-center justify-center">
                              <IconMail size={14} stroke={1.5} className={colors.icon} />
                            </div>
                          )}
                          {event.channels.whatsapp && (
                            <div className="flex items-center justify-center">
                              <IconMessageCircle size={14} stroke={1.5} className={colors.icon} />
                            </div>
                          )}
                          {event.channels.sms && (
                            <div className="flex items-center justify-center">
                              <IconPhone size={14} stroke={1.5} className={colors.icon} />
                            </div>
                          )}
                          {event.channels.link && (
                            <div className="flex items-center justify-center">
                              <IconLink size={14} stroke={1.5} className={colors.icon} />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedTimelineVisualization;