import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Play,
  Bell,
  Link2,
  CheckCircle,
  AlertTriangle,
  UserX,
  Mail,
  MessageCircle,
  Phone,
  AlertCircle as AlertCircleIcon,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Base node wrapper component
interface BaseNodeProps {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
    dayOffset?: number; // D-5, D+3, etc.
  };
  selected?: boolean;
  type?: string;
}

const BaseNode = ({ data, selected, type, children }: BaseNodeProps & { children?: React.ReactNode }) => {
  const colorClasses = {
    start: 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700',
    notification: 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',
    notify: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700',
    success: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700',
    escalate: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',
  };

  const colorClass = data.color ? colorClasses[data.color as keyof typeof colorClasses] : 'bg-card border-border';

  // Format day offset
  const formatDayOffset = (offset: number | undefined) => {
    if (offset === undefined) return null;
    if (offset === 0) return 'D (Vencimento)';
    if (offset > 0) return `D+${offset}`;
    return `D${offset}`; // Already includes the minus sign
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 shadow-card transition-all min-w-[200px]',
        colorClass,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Day offset badge at top */}
      {data.dayOffset !== undefined && (
        <div className="flex justify-center -mt-1 mb-2">
          <Badge variant="outline" className="bg-background text-foreground border font-mono text-xs pointer-events-none">
            {formatDayOffset(data.dayOffset)}
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        {data.icon && <div className="flex-shrink-0 mt-0.5">{data.icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

// Start Node
export const StartNode = memo(({ data, selected }: NodeProps) => (
  <>
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Play className="w-5 h-5 text-purple-600" />, 
        color: 'start' 
      }} 
      selected={selected} 
      type="start"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
  </>
));
StartNode.displayName = 'StartNode';

// Send Notification Node
export const SendNotificationNode = memo(({ data, selected }: NodeProps) => {
  const channels = [];
  if (data.sendEmail) channels.push(<Mail key="email" className="w-3 h-3" />);
  if (data.sendWhatsApp) channels.push(<MessageCircle key="whatsapp" className="w-3 h-3" />);
  if (data.sendSMS) channels.push(<Phone key="sms" className="w-3 h-3" />);

  // Determine color based on day offset
  const dayOffset = data.dayOffset ?? 0;
  let colorClass = 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700'; // Before expiry
  let handleColor = '!bg-blue-500';
  let iconColor = 'text-blue-600';
  
  if (dayOffset > 0 && dayOffset <= 7) {
    // A few days after expiry - yellow/orange
    colorClass = 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700';
    handleColor = '!bg-amber-500';
    iconColor = 'text-amber-600';
  } else if (dayOffset > 7) {
    // Many days after - purple/red
    colorClass = 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700';
    handleColor = '!bg-purple-500';
    iconColor = 'text-purple-600';
  }

  return (
    <>
      <Handle type="target" position={Position.Top} className={handleColor} />
      <div
        className={cn(
          'px-4 py-3 rounded-xl border-2 shadow-card transition-all min-w-[220px]',
          colorClass,
          selected && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        {/* Day offset badge at top */}
        {data.dayOffset !== undefined && (
          <div className="flex justify-center -mt-1 mb-2">
            <Badge variant="outline" className="bg-background text-foreground border font-mono text-xs pointer-events-none">
              {data.dayOffset === 0 ? 'D (Vencimento)' : data.dayOffset > 0 ? `D+${data.dayOffset}` : `D${data.dayOffset}`}
            </Badge>
          </div>
        )}

        <div className="flex items-start gap-3 mb-2">
          <div className="flex-shrink-0 mt-0.5">
            <Bell className={cn('w-5 h-5', iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
            )}
          </div>
        </div>

        {/* Time of day - centered, with lucide Clock and outlined badge */}
        {data.timeOfDay && (
          <div className="flex justify-center mt-2 mb-2">
            <Badge variant="outline" className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {data.timeOfDay}
            </Badge>
          </div>
        )}

        {/* Channel indicators */}
        {channels.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
            {data.sendEmail && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </Badge>
            )}
            {data.sendWhatsApp && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                WhatsApp
              </Badge>
            )}
            {data.sendSMS && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Phone className="w-3 h-3" />
                SMS
              </Badge>
            )}
            {data.includePaymentLink && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                Link
              </Badge>
            )}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={handleColor} />
    </>
  );
});
SendNotificationNode.displayName = 'SendNotificationNode';

// Notify Operator Node
export const NotifyOperatorNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <UserX className="w-5 h-5 text-yellow-600" />, 
        color: 'notify' 
      }} 
      selected={selected} 
      type="notifyOperator"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
  </>
));
NotifyOperatorNode.displayName = 'NotifyOperatorNode';

// Success End Node
export const SuccessNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, 
        color: 'success' 
      }} 
      selected={selected} 
      type="success"
    />
  </>
));
SuccessNode.displayName = 'SuccessNode';

// Judicial Escalation Node
export const JudicialEscalationNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-red-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />, 
        color: 'escalate' 
      }} 
      selected={selected} 
      type="judicialEscalation"
    />
  </>
));
JudicialEscalationNode.displayName = 'JudicialEscalationNode';

// No Payment Node (Soft ending)
export const NoPaymentNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <AlertCircleIcon className="w-5 h-5 text-orange-600" />, 
        color: 'notify' 
      }} 
      selected={selected} 
      type="noPayment"
    />
  </>
));
NoPaymentNode.displayName = 'NoPaymentNode';

