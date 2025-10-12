import { 
  Play, 
  User, 
  FileSearch, 
  ShieldCheck, 
  GitBranch, 
  Timer, 
  ThumbsUp, 
  Bot, 
  StickyNote,
  Database,
  ArrowLeftRight,
  Boxes
} from 'lucide-react';
export interface NodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'core' | 'logic' | 'tools' | 'data';
  color: string;
}

export const nodeTypes: NodeType[] = [
  // Core nodes
  {
    type: 'start',
    label: 'Start',
    description: 'Workflow entry point',
    icon: <Play className="w-4 h-4" />,
    category: 'core',
    color: 'start',
  },
  {
    type: 'agent',
    label: 'Agent',
    description: 'AI agent action',
    icon: <Bot className="w-4 h-4" />,
    category: 'core',
    color: 'agent',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: <ThumbsUp className="w-4 h-4" />,
    category: 'core',
    color: 'end',
  },
  {
    type: 'note',
    label: 'Note',
    description: 'Documentation',
    icon: <StickyNote className="w-4 h-4" />,
    category: 'core',
    color: 'note',
  },
  
  // Logic nodes
  {
    type: 'ifElse',
    label: 'If / else',
    description: 'Conditional branching',
    icon: <GitBranch className="w-4 h-4" />,
    category: 'logic',
    color: 'logic',
  },
  {
    type: 'while',
    label: 'While',
    description: 'Loop condition',
    icon: <Timer className="w-4 h-4" />,
    category: 'logic',
    color: 'logic',
  },
  {
    type: 'userApproval',
    label: 'User approval',
    description: 'Manual intervention',
    icon: <User className="w-4 h-4" />,
    category: 'logic',
    color: 'approval',
  },
  
  // Tools
  {
    type: 'fileSearch',
    label: 'File search',
    description: 'Search documents',
    icon: <FileSearch className="w-4 h-4" />,
    category: 'tools',
    color: 'tool',
  },
  {
    type: 'guardrails',
    label: 'Guardrails',
    description: 'Safety checks',
    icon: <ShieldCheck className="w-4 h-4" />,
    category: 'tools',
    color: 'tool',
  },
  {
    type: 'mcp',
    label: 'MCP',
    description: 'Model Context Protocol',
    icon: <Boxes className="w-4 h-4" />,
    category: 'tools',
    color: 'tool',
  },
  
  // Data
  {
    type: 'transform',
    label: 'Transform',
    description: 'Data transformation',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    category: 'data',
    color: 'data',
  },
  {
    type: 'setState',
    label: 'Set state',
    description: 'Store variables',
    icon: <Database className="w-4 h-4" />,
    category: 'data',
    color: 'data',
  },
];

interface NodeLibraryProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export const NodeLibrary = ({ onDragStart }: NodeLibraryProps) => {
  const categories = {
    core: { label: 'Core', emoji: '⚡' },
    logic: { label: 'Logic', emoji: '🔀' },
    tools: { label: 'Tools', emoji: '🛠️' },
    data: { label: 'Data', emoji: '💾' },
  };

  return (
    <div className="h-full">
      <h3 className="font-semibold mb-4 text-foreground">Node Library</h3>
      
      <div className="space-y-4">
        {Object.entries(categories).map(([key, { label, emoji }]) => {
          const categoryNodes = nodeTypes.filter(node => node.category === key);
          
          return (
            <div key={key}>
              <div className="text-xs font-medium text-muted-foreground mb-2">
                {emoji} {label.toUpperCase()}
              </div>
              <div className="space-y-2">
                {categoryNodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    className="p-3 border rounded-lg bg-card hover:bg-accent transition-fast cursor-grab active:cursor-grabbing shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      {node.icon}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{node.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{node.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

