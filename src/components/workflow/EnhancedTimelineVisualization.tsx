import React from 'react';
import { Mail, MessageCircle, Phone, Link2, Bell, UserX, Clock } from 'lucide-react';

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
  agentConfig: {
    tone: 'friendly' | 'neutral' | 'formal' | 'firm';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    autoEscalate: boolean;
    adaptiveTiming: boolean;
    negotiationEnabled: boolean;
  };
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
    <div className="relative">
      {/* Timeline container */}
      <div className="relative py-6">
        {/* Colored timeline track */}
        <div className="absolute top-12 left-0 right-0 h-2 rounded-full bg-gradient-to-r from-blue-400 via-amber-400 to-purple-500 shadow-inner"></div>

        <div className="relative flex justify-between">
          {allDays.map((day, idx) => {
            const event = workflow.events.find(e => e.dayOffset === day);
            const colors = getNodeColor(day);
            const isFirstNode = idx === 0;
            const isLastNode = idx === allDays.length - 1;
            
            return (
              <div key={day} className="flex flex-col items-center flex-1 relative group">
                {/* Day label above timeline */}
                <div className="text-xs font-bold font-mono mb-1">
                  {day === 0 ? 'D (Vencimento)' : day < 0 ? `D${day}` : `D+${day}`}
                </div>

                {/* Day marker dot on the timeline */}
                <div className="relative mb-3">
                  <div className={`w-4 h-4 rounded-full ${isFirstNode || isLastNode ? 'bg-primary shadow-glow' : 'bg-background border-2 border-foreground/20'} flex items-center justify-center transition-transform transform group-hover:scale-125 z-10`}>
                    {event && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                  </div>
                </div>

                {/* Event card below timeline */}
                {event && (
                  <div className={`p-3 rounded-xl border-2 ${colors.bg} ${colors.border} shadow-card transition-all hover:shadow-hover transform group-hover:-translate-y-1 mt-3 min-w-[140px]`}>
                    {/* Main icon and Time of day */}
                    {event.timeOfDay && (
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {getMainIcon(event.nodeType, colors.icon)}
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium">{event.timeOfDay}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Channel icons inline */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {event.channels.email && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.icon}`}>
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {event.channels.whatsapp && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.icon}`}>
                          <MessageCircle className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {event.channels.sms && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.icon}`}>
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                      )}
                      {event.channels.link && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${colors.icon}`}>
                          <Link2 className="w-3.5 h-3.5" />
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
