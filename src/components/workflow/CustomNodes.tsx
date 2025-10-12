import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { 
  Play, 
  User, 
  FileSearch, 
  ShieldCheck, 
  GitBranch, 
  Timer, 
  ThumbsUp, 
  ThumbsDown, 
  Bot, 
  StickyNote,
  Database,
  ArrowLeftRight,
  Boxes
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Base node wrapper component
interface BaseNodeProps {
  data: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    color?: string;
  };
  selected?: boolean;
  type?: string;
}

const BaseNode = ({ data, selected, type, children }: BaseNodeProps & { children?: React.ReactNode }) => {
  const colorClasses = {
    start: 'bg-green-50 border-green-300 dark:bg-green-950/30 dark:border-green-700',
    end: 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-700',
    agent: 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700',
    logic: 'bg-purple-50 border-purple-300 dark:bg-purple-950/30 dark:border-purple-700',
    tool: 'bg-orange-50 border-orange-300 dark:bg-orange-950/30 dark:border-orange-700',
    approval: 'bg-yellow-50 border-yellow-300 dark:bg-yellow-950/30 dark:border-yellow-700',
    data: 'bg-cyan-50 border-cyan-300 dark:bg-cyan-950/30 dark:border-cyan-700',
    note: 'bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700',
  };

  const colorClass = data.color ? colorClasses[data.color as keyof typeof colorClasses] : 'bg-card border-border';

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 shadow-card transition-all min-w-[180px]',
        colorClass,
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center gap-2">
        {data.icon && <div className="flex-shrink-0">{data.icon}</div>}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground truncate">{data.description}</div>
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
    <BaseNode data={{ ...data, icon: <Play className="w-4 h-4 text-green-600" />, color: 'start' }} selected={selected} type="start">
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </BaseNode>
  </>
));
StartNode.displayName = 'StartNode';

// End Node
export const EndNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-red-500" />
    <BaseNode data={{ ...data, icon: <ThumbsUp className="w-4 h-4 text-red-600" />, color: 'end' }} selected={selected} type="end" />
  </>
));
EndNode.displayName = 'EndNode';

// Agent Node
export const AgentNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-blue-500" />
    <BaseNode data={{ ...data, icon: <Bot className="w-4 h-4 text-blue-600" />, color: 'agent' }} selected={selected} type="agent" />
    <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
  </>
));
AgentNode.displayName = 'AgentNode';

// Note Node
export const NoteNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-amber-500" />
    <BaseNode data={{ ...data, icon: <StickyNote className="w-4 h-4 text-amber-600" />, color: 'note' }} selected={selected} type="note" />
    <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
  </>
));
NoteNode.displayName = 'NoteNode';

// File Search Node
export const FileSearchNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <BaseNode data={{ ...data, icon: <FileSearch className="w-4 h-4 text-orange-600" />, color: 'tool' }} selected={selected} type="fileSearch" />
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
  </>
));
FileSearchNode.displayName = 'FileSearchNode';

// Guardrails Node
export const GuardrailsNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <BaseNode data={{ ...data, icon: <ShieldCheck className="w-4 h-4 text-orange-600" />, color: 'tool' }} selected={selected} type="guardrails" />
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
  </>
));
GuardrailsNode.displayName = 'GuardrailsNode';

// MCP Node
export const MCPNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-orange-500" />
    <BaseNode data={{ ...data, icon: <Boxes className="w-4 h-4 text-orange-600" />, color: 'tool' }} selected={selected} type="mcp" />
    <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
  </>
));
MCPNode.displayName = 'MCPNode';

// If/Else Node
export const IfElseNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-purple-500" />
    <BaseNode data={{ ...data, icon: <GitBranch className="w-4 h-4 text-purple-600" />, color: 'logic' }} selected={selected} type="ifElse">
      <div className="flex gap-2 mt-2">
        <Handle type="source" position={Position.Bottom} id="true" className="!bg-green-500 !left-[35%]" />
        <Handle type="source" position={Position.Bottom} id="false" className="!bg-red-500 !left-[65%]" />
      </div>
    </BaseNode>
  </>
));
IfElseNode.displayName = 'IfElseNode';

// While Node
export const WhileNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-purple-500" />
    <BaseNode data={{ ...data, icon: <Timer className="w-4 h-4 text-purple-600" />, color: 'logic' }} selected={selected} type="while" />
    <Handle type="source" position={Position.Bottom} className="!bg-purple-500" />
  </>
));
WhileNode.displayName = 'WhileNode';

// User Approval Node
export const UserApprovalNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-yellow-500" />
    <BaseNode data={{ ...data, icon: <User className="w-4 h-4 text-yellow-600" />, color: 'approval' }} selected={selected} type="userApproval">
      <div className="flex gap-2 mt-2">
        <Handle type="source" position={Position.Bottom} id="approve" className="!bg-green-500 !left-[35%]" />
        <Handle type="source" position={Position.Bottom} id="reject" className="!bg-red-500 !left-[65%]" />
      </div>
    </BaseNode>
  </>
));
UserApprovalNode.displayName = 'UserApprovalNode';

// Transform Node
export const TransformNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
    <BaseNode data={{ ...data, icon: <ArrowLeftRight className="w-4 h-4 text-cyan-600" />, color: 'data' }} selected={selected} type="transform" />
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
  </>
));
TransformNode.displayName = 'TransformNode';

// Set State Node
export const SetStateNode = memo(({ data, selected }: NodeProps) => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-cyan-500" />
    <BaseNode data={{ ...data, icon: <Database className="w-4 h-4 text-cyan-600" />, color: 'data' }} selected={selected} type="setState" />
    <Handle type="source" position={Position.Bottom} className="!bg-cyan-500" />
  </>
));
SetStateNode.displayName = 'SetStateNode';

