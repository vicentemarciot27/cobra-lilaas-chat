import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
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
  GitBranch,
  Beaker
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
    days?: number;
    timing?: 'before' | 'after' | 'on';
  };
  selected?: boolean;
  type?: string;
}

const BaseNode = ({ data, selected, type, children }: BaseNodeProps & { children?: React.ReactNode }) => {
  const colorClasses = {
    trigger: 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700',
    email: 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',
    whatsapp: 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700',
    payment: 'bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700',
    agent: 'bg-cyan-50 border-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-700',
    notify: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700',
    end: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700',
    escalate: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',
    wait: 'bg-slate-50 border-slate-300 dark:bg-slate-950/30 dark:border-slate-700',
  };

  const colorClass = data.color ? colorClasses[data.color as keyof typeof colorClasses] : 'bg-card border-border';

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 shadow-card transition-all min-w-[200px]',
        colorClass,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-start gap-3">
        {data.icon && <div className="flex-shrink-0 mt-0.5">{data.icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
          )}
          {data.days !== undefined && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {data.timing === 'before' && `${data.days} dias antes`}
              {data.timing === 'after' && `${data.days} dias depois`}
              {data.timing === 'on' && 'No vencimento'}
            </Badge>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

// Timeline Trigger Node
export const TimelineTriggerNode = memo(({ data, selected }: NodeProps) => (
  <>
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Calendar className="w-5 h-5 text-purple-600" />, 
        color: 'trigger' 
      }} 
      selected={selected} 
      type="timelineTrigger"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
  </>
));
TimelineTriggerNode.displayName = 'TimelineTriggerNode';

// Cohort Filter Node
export const CohortFilterNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-purple-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Users className="w-5 h-5 text-purple-600" />, 
        color: 'trigger' 
      }} 
      selected={selected} 
      type="cohortFilter"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
  </>
));
CohortFilterNode.displayName = 'CohortFilterNode';

// Send Email Node
export const SendEmailNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-blue-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Mail className="w-5 h-5 text-blue-600" />, 
        color: 'email' 
      }} 
      selected={selected} 
      type="sendEmail"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
  </>
));
SendEmailNode.displayName = 'SendEmailNode';

// Send WhatsApp Node
export const SendWhatsAppNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-green-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <MessageCircle className="w-5 h-5 text-green-600" />, 
        color: 'whatsapp' 
      }} 
      selected={selected} 
      type="sendWhatsApp"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
  </>
));
SendWhatsAppNode.displayName = 'SendWhatsAppNode';

// WhatsApp with Agent Node
export const WhatsAppAgentNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Bot className="w-5 h-5 text-cyan-600" />, 
        color: 'agent' 
      }} 
      selected={selected} 
      type="whatsappAgent"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
  </>
));
WhatsAppAgentNode.displayName = 'WhatsAppAgentNode';

// Send Payment Link Node
export const SendPaymentLinkNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Link2 className="w-5 h-5 text-orange-600" />, 
        color: 'payment' 
      }} 
      selected={selected} 
      type="sendPaymentLink"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
  </>
));
SendPaymentLinkNode.displayName = 'SendPaymentLinkNode';

// Notify User Node
export const NotifyUserNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Bell className="w-5 h-5 text-yellow-600" />, 
        color: 'notify' 
      }} 
      selected={selected} 
      type="notifyUser"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-yellow-500" />
  </>
));
NotifyUserNode.displayName = 'NotifyUserNode';

// Wait Node
export const WaitNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-slate-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <Clock className="w-5 h-5 text-slate-600" />, 
        color: 'wait' 
      }} 
      selected={selected} 
      type="wait"
    />
    <Handle type="source" position={Position.Bottom} className="!bg-slate-500" />
  </>
));
WaitNode.displayName = 'WaitNode';

// Success End Node
export const SuccessEndNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <CheckCircle className="w-5 h-5 text-emerald-600" />, 
        color: 'end' 
      }} 
      selected={selected} 
      type="successEnd"
    />
  </>
));
SuccessEndNode.displayName = 'SuccessEndNode';

// Escalate Node
export const EscalateNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-red-500" />
    <BaseNode 
      data={{ 
        ...data, 
        icon: <AlertTriangle className="w-5 h-5 text-red-600" />, 
        color: 'escalate' 
      }} 
      selected={selected} 
      type="escalate"
    />
  </>
));
EscalateNode.displayName = 'EscalateNode';

// A/B Test Split Node
export const ABTestSplitNode = memo(({ data, selected }: NodeProps) => {
  const colorClasses = {
    test: 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/30 dark:border-indigo-700',
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-indigo-500" />
      <div
        className={cn(
          'px-4 py-3 rounded-xl border-2 shadow-card transition-all min-w-[220px]',
          colorClasses.test,
          selected && 'ring-2 ring-primary ring-offset-2'
        )}
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 mt-0.5">
            <Beaker className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground mt-1">{data.description}</div>
            )}
          </div>
        </div>
        
        {/* Variant badges */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Variante A {data.splitPercentage ? `${data.splitPercentage}%` : '50%'}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Variante B {data.splitPercentage ? `${100 - data.splitPercentage}%` : '50%'}
          </Badge>
        </div>

        {/* Test status */}
        {data.testStatus && (
          <Badge 
            variant={data.testStatus === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {data.testStatus === 'active' ? '🔬 Teste Ativo' : '📊 Teste Concluído'}
          </Badge>
        )}

        {/* Winning variant indicator */}
        {data.winner && (
          <Badge variant="default" className="mt-2 text-xs bg-green-500">
            🏆 Vencedor: Variante {data.winner}
          </Badge>
        )}
      </div>
      
      {/* Two output handles for variant A and B */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="variant-a" 
        className="!bg-blue-500 !left-[35%]"
        style={{ left: '35%' }}
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="variant-b" 
        className="!bg-purple-500 !left-[65%]"
        style={{ left: '65%' }}
      />
    </>
  );
});
ABTestSplitNode.displayName = 'ABTestSplitNode';

