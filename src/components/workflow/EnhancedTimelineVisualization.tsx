import React from 'react';
import { Mail, MessageCircle, Phone, Link2, Bell, UserX, Clock } from 'lucide-react';
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
  emoji: string;
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

  // Determine node color based on day offset (matching TimelineNodes.tsx)
  const getNodeColor = (day: number) => {
    // Before due date (D-X) - Blue
    if (day < 0) return {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-300 dark:border-blue-700',
      icon: 'text-blue-600 dark:text-blue-400',
      handle: 'bg-blue-500'
    };
    // A few days after due date (D to D+7) - Amber/Yellow
    if (day >= 0 && day <= 7) return {
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-300 dark:border-amber-700',
      icon: 'text-amber-600 dark:text-amber-400',
      handle: 'bg-amber-500'
    };
    // Many days after (D+8+) - Purple/Red
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      border: 'border-purple-300 dark:border-purple-700',
      icon: 'text-purple-600 dark:text-purple-400',
      handle: 'bg-purple-500'
    };
  };

  // Get main icon based on node type
  const getMainIcon = (nodeType?: string, iconClass?: string) => {
    if (nodeType === 'sendNotification') {
      return <Bell className={`w-4 h-4 ${iconClass}`} />;
    }
    if (nodeType === 'notifyOperator') {
      return <UserX className={`w-4 h-4 ${iconClass}`} />;
    }
    return <Bell className={`w-4 h-4 ${iconClass}`} />; // Default
  };

  return (
    <div className="relative py-4">
      {/* Timeline container */}
      <div className="relative">
        {/* Simple timeline track */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-border"></div>

        <div className="relative flex justify-between gap-2">
          {allDays.map((day, idx) => {
            const event = workflow.events.find(e => e.dayOffset === day);
            const colors = getNodeColor(day);
            const isFirstNode = idx === 0;
            const isLastNode = idx === allDays.length - 1;
            
            return (
              <div key={day} className="flex flex-col items-center flex-1 min-w-0">
                {/* Day label above timeline */}
                <div className="text-xs font-semibold text-muted-foreground mb-2" style={{ fontFamily: "'Courier New', Courier, monospace" }}>
                  {day === 0 ? 'D (Vencimento)' : day < 0 ? `D${day}` : `D+${day}`}
                </div>

                {/* Day marker dot on the timeline */}
                <div className="relative mb-3 z-10">
                  <div className={`w-3 h-3 rounded-full ${event ? 'bg-primary' : 'bg-muted border-2 border-border'} transition-all`}>
                  </div>
                </div>

                {/* Event card below timeline */}
                {event && (
                  <div className={`p-2.5 rounded-lg border ${colors.bg} ${colors.border} w-full`}>
                    {/* Main icon and Time of day */}
                    {event.timeOfDay && (
                      <div className="flex items-center justify-center gap-1.5 mb-2">
                        {getMainIcon(event.nodeType, colors.icon)}
                        <span className="text-xs font-medium text-foreground">{event.timeOfDay}</span>
                      </div>
                    )}
                    
                    {/* Channel icons inline */}
                    <div className="flex gap-1 justify-center items-center">
                      {event.channels.email && (
                        <div className="flex items-center justify-center">
                          <Mail className={`w-3.5 h-3.5 ${colors.icon}`} />
                        </div>
                      )}
                      {event.channels.whatsapp && (
                        <div className="flex items-center justify-center">
                          <MessageCircle className={`w-3.5 h-3.5 ${colors.icon}`} />
                        </div>
                      )}
                      {event.channels.sms && (
                        <div className="flex items-center justify-center">
                          <Phone className={`w-3.5 h-3.5 ${colors.icon}`} />
                        </div>
                      )}
                      {event.channels.link && (
                        <div className="flex items-center justify-center">
                          <Link2 className={`w-3.5 h-3.5 ${colors.icon}`} />
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
  );
};

export default EnhancedTimelineVisualization;
