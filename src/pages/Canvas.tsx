import { useState, useCallback, useRef, useEffect } from "react";
import { ArrowLeft, Save, AlertCircle, BookOpen, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  StartNode,
  SendNotificationNode,
  NotifyOperatorNode,
  SuccessNode,
  JudicialEscalationNode,
  NoPaymentNode,
} from '@/components/workflow/TimelineNodes';
import { TimelineNodeLibrary, timelineNodeTypes } from '@/components/workflow/TimelineNodeLibrary';
import { TimelineNodeConfig } from '@/components/workflow/TimelineNodeConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useData, DebtorProfile } from "@/contexts/DataContext";
import { getWorkflowTemplates } from "../data/defaults";
import { toast } from "sonner";

// Define custom node types for React Flow
const customNodeTypes: NodeTypes = {
  start: StartNode,
  sendNotification: SendNotificationNode,
  notifyOperator: NotifyOperatorNode,
  success: SuccessNode,
  judicialEscalation: JudicialEscalationNode,
  noPayment: NoPaymentNode,
};

// Initial empty workflow
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Timeline validation function
const validateTimeline = (nodes: Node[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const timelineNodes = nodes.filter(n => 
    ['sendNotification', 'notifyOperator'].includes(n.type || '')
  );

  if (timelineNodes.length === 0) {
    return { isValid: true, errors: [] };
  }

  // Sort by dayOffset
  const sorted = [...timelineNodes].sort((a, b) => {
    const offsetA = a.data.dayOffset ?? 0;
    const offsetB = b.data.dayOffset ?? 0;
    return offsetA - offsetB;
  });

  // Check for chronological order
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentOffset = sorted[i].data.dayOffset ?? 0;
    const nextOffset = sorted[i + 1].data.dayOffset ?? 0;
    
    if (currentOffset === nextOffset) {
      errors.push(
        `Dois nós no mesmo dia: ${sorted[i].data.label} e ${sorted[i + 1].data.label} (ambos em D${currentOffset >= 0 ? '+' : ''}${currentOffset})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Map profile to ruler ID helper
const getProfileLabel = (profile: DebtorProfile): string => {
  const labels: Record<DebtorProfile, string> = {
    'good_payer': 'Bom Pagador',
    'bad_payer': 'Mau Pagador',
    'new': 'Novo Cliente'
  };
  return labels[profile];
};

function CanvasFlow() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const loadedRulerRef = useRef<string | null>(null);
  const { rulers, saveWorkflow, getWorkflow } = useData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const workflowTemplates = getWorkflowTemplates();
  
  // Get ruler ID from URL or default to first ruler
  const rulerIdFromUrl = searchParams.get('ruler') || (rulers.length > 0 ? rulers[0].id : '');
  const [currentRulerId, setCurrentRulerId] = useState<string>(rulerIdFromUrl);
  
  // Get current ruler info
  const currentRuler = rulers.find(r => r.id === currentRulerId);
  // Validate timeline whenever nodes change
  const validateAndUpdateNodes = useCallback((newNodes: Node[]) => {
    const validation = validateTimeline(newNodes);
    setValidationErrors(validation.errors);
  }, []);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node drag from library
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle node drop on canvas
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeType = timelineNodeTypes.find(n => n.type === type);
      
      // Center the node horizontally if dropped near edges
      const centeredPosition = {
        x: position.x < 200 ? 400 : position.x,
        y: position.y,
      };
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: centeredPosition,
        data: { 
          label: nodeType?.label || type,
          description: nodeType?.description || '',
          // Default values for notification nodes
          ...(type === 'sendNotification' && {
            dayOffset: -3,
            sendEmail: true,
            sendWhatsApp: true,
            sendSMS: true,
            timeOfDay: '09:00',
          }),
          ...(type === 'notifyOperator' && {
            dayOffset: 7,
          }),
        },
      };

      const updatedNodes = nodes.concat(newNode);
      setNodes(updatedNodes);
      validateAndUpdateNodes(updatedNodes);
    },
    [reactFlowInstance, nodes, setNodes, validateAndUpdateNodes]
  );

  // Handle drag start from library
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update node data
  const onNodeUpdate = useCallback(
    (nodeId: string, data: any) => {
      const updatedNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data };
        }
        return node;
      });
      setNodes(updatedNodes);
      validateAndUpdateNodes(updatedNodes);
      // Update selected node
      setSelectedNode((prev) => prev?.id === nodeId ? { ...prev, data } : prev);
    },
    [nodes, setNodes, validateAndUpdateNodes]
  );

  // Delete node
  const onNodeDelete = useCallback(
    (nodeId: string) => {
      const updatedNodes = nodes.filter((node) => node.id !== nodeId);
      setNodes(updatedNodes);
      validateAndUpdateNodes(updatedNodes);
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setSelectedNode(null);
    },
    [nodes, setNodes, setEdges, validateAndUpdateNodes]
  );

  // Duplicate node
  const onNodeDuplicate = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
      if (nodeToDuplicate) {
        const newNode: Node = {
          ...nodeToDuplicate,
          id: `${nodeToDuplicate.type}-${Date.now()}`,
          position: {
            x: nodeToDuplicate.position.x + 50,
            y: nodeToDuplicate.position.y + 50,
          },
        };
        const updatedNodes = nodes.concat(newNode);
        setNodes(updatedNodes);
        validateAndUpdateNodes(updatedNodes);
      }
    },
    [nodes, setNodes, validateAndUpdateNodes]
  );

  // Load template
  const loadTemplate = useCallback((templateId: string) => {
    const template = workflowTemplates.find(t => t.id === templateId);
    if (template) {
      setNodes(template.nodes as Node[]);
      setEdges(template.edges as Edge[]);
      validateAndUpdateNodes(template.nodes as Node[]);
      setShowTemplateModal(false);
      
      // Fit view after a short delay to ensure nodes are rendered
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ 
            padding: 0.2,
            duration: 400,
            maxZoom: 1,
          });
        }
      }, 50);
    }
  }, [reactFlowInstance, setNodes, setEdges, validateAndUpdateNodes]);

  // Load workflow from ruler or template
  useEffect(() => {
    // Only run this once the reactFlowInstance is available
    if (!reactFlowInstance || !currentRulerId) return;
    
    // Don't reload if we already loaded this ruler
    if (loadedRulerRef.current === currentRulerId) return;
    
    console.log('Loading workflow for ruler:', currentRulerId);
    loadedRulerRef.current = currentRulerId;
    
    // Check if there's a saved workflow for this ruler
    const savedWorkflow = getWorkflow(currentRulerId);
    console.log('Saved workflow:', savedWorkflow);
    
    if (savedWorkflow && savedWorkflow.nodes && savedWorkflow.nodes.length > 0) {
      // Load saved workflow
      console.log('Loading saved workflow with', savedWorkflow.nodes.length, 'nodes');
      setNodes(savedWorkflow.nodes);
      setEdges(savedWorkflow.edges || []);
      validateAndUpdateNodes(savedWorkflow.nodes);
      setHasUnsavedChanges(false);
      
      // Fit view after loading
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ 
            padding: 0.2,
            duration: 400,
            maxZoom: 1,
          });
        }
      }, 50);
    } else {
      // Check for template in URL
      const templateId = searchParams.get('template');
      
      if (templateId) {
        // If there's a template ID in the URL, load it
        console.log('Loading template from URL:', templateId);
        loadTemplate(templateId);
        setHasUnsavedChanges(true);
      } else {
        // If no workflow and no template, load default template
        console.log('Loading default template');
        loadTemplate('new');
        setHasUnsavedChanges(true);
      }
    }
  }, [currentRulerId, reactFlowInstance]);
  
  // Update URL when ruler changes
  useEffect(() => {
    if (currentRulerId) {
      setSearchParams({ ruler: currentRulerId });
    }
  }, [currentRulerId, setSearchParams]);

  // Save workflow
  const onSave = useCallback(() => {
    if (reactFlowInstance && currentRulerId) {
      const flow = reactFlowInstance.toObject();
      saveWorkflow(currentRulerId, flow);
      setHasUnsavedChanges(false);
      toast.success(`Régua ${currentRuler?.name || currentRulerId} salva com sucesso!`);
      console.log('Workflow salvo para ruler:', currentRulerId, flow);
    }
  }, [reactFlowInstance, currentRulerId, currentRuler, saveWorkflow]);

  // Track changes to mark as unsaved
  useEffect(() => {
    // Skip marking as unsaved on initial load
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges]);

  // Export workflow as JSON
  const onExport = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const dataStr = JSON.stringify(flow, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'regua-cobranca.json';
      link.click();
    }
  }, [reactFlowInstance]);

  return (
    <div className="h-screen w-screen bg-gradient-soft flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card shadow-card z-20 flex-shrink-0">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/canvas")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">Editor de Régua</h1>
                  {currentRuler && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          
                            {currentRuler.name}
        
                          <ChevronsUpDown className="w-4 h-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-[200px]">
                        {rulers.map((ruler) => (
                          <DropdownMenuItem
                            key={ruler.id}
                            onClick={() => setCurrentRulerId(ruler.id)}
                            className={currentRulerId === ruler.id ? "bg-accent" : ""}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{ruler.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {getProfileLabel(ruler.profile_target)}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Configure os lembretes automáticos para seus devedores</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="text-sm text-amber-600 font-medium">
                  Mudanças não salvas
                </span>
              )}
              <Button 
                variant="outline"
                onClick={() => setShowTemplateModal(true)}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button 
                onClick={onSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!currentRulerId}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Erro na régua:</strong>
                <ul className="list-disc list-inside mt-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Node Library Sidebar */}
        <div className="w-72 border-r bg-card flex-shrink-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <TimelineNodeLibrary onDragStart={onDragStart} />
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 min-w-0" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(instance) => {
              console.log('ReactFlow initialized');
              setReactFlowInstance(instance);
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={customNodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
              maxZoom: 1,
            }}
            className="bg-gradient-soft"
          >
            <Controls />
            <MiniMap 
              nodeStrokeWidth={3}
              zoomable
              pannable
              className="bg-card border border-border rounded-lg"
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={16} 
              size={1}
              className="bg-background"
            />
          </ReactFlow>
        </div>

        {/* Configuration Panel Sidebar */}
        <div className="w-80 border-l bg-card flex-shrink-0 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <TimelineNodeConfig
              selectedNode={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={onNodeUpdate}
              onDelete={onNodeDelete}
              onDuplicate={onNodeDuplicate}
            />
          </div>
        </div>
      </div>

      {/* Template Selection Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Régua de Cobrança</DialogTitle>
            <DialogDescription>
              Escolha um template e personalize conforme necessário
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 mt-4">
            {workflowTemplates.map((template) => (
              <Card 
                key={template.id}
                className="p-4 hover:border-primary transition-all cursor-pointer"
                onClick={() => loadTemplate(template.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {template.nodes.length} passos
                  </Badge>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
              Cancelar
            </Button>
            <Button variant="outline" onClick={() => {
              setNodes([]);
              setEdges([]);
              setValidationErrors([]);
              setShowTemplateModal(false);
            }}>
              Começar do Zero
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Wrap with ReactFlowProvider
export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasFlow />
    </ReactFlowProvider>
  );
}

