import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Copy, Trash2 } from 'lucide-react';
import { Node } from 'reactflow';

interface NodeConfigPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
  onDuplicate: (nodeId: string) => void;
}

export const NodeConfigPanel = ({
  selectedNode,
  onClose,
  onUpdate,
  onDelete,
  onDuplicate,
}: NodeConfigPanelProps) => {
  if (!selectedNode) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Select a node to configure</p>
        </div>
      </div>
    );
  }

  const handleLabelChange = (value: string) => {
    onUpdate(selectedNode.id, { ...selectedNode.data, label: value });
  };

  const handleDescriptionChange = (value: string) => {
    onUpdate(selectedNode.id, { ...selectedNode.data, description: value });
  };

  const renderNodeSpecificConfig = () => {
    switch (selectedNode.type) {
      case 'agent':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="model">Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Put the research together in a nice display using the output format described."
                className="min-h-[100px] mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="chat-history">Include chat history</Label>
              <Switch id="chat-history" defaultChecked />
            </div>

            <div>
              <Label htmlFor="reasoning">Reasoning effort</Label>
              <Select defaultValue="minimal">
                <SelectTrigger id="reasoning">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="output-format">Output format</Label>
              <Select defaultValue="widget">
                <SelectTrigger id="output-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="widget">Widget</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'ifElse':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Textarea
                id="condition"
                placeholder="Enter condition expression"
                className="min-h-[80px] mt-2"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Use JavaScript expressions to evaluate conditions
            </div>
          </div>
        );

      case 'userApproval':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="approval-message">Approval Message</Label>
              <Textarea
                id="approval-message"
                placeholder="Describe what needs approval..."
                className="min-h-[80px] mt-2"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">Auto-approve after timeout</Label>
              <Switch id="auto-approve" />
            </div>
          </div>
        );

      case 'transform':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="transform-code">Transformation Code</Label>
              <Textarea
                id="transform-code"
                placeholder="return { ...input, processed: true }"
                className="min-h-[120px] mt-2 font-mono text-xs"
              />
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="note-content">Note Content</Label>
              <Textarea
                id="note-content"
                placeholder="Add documentation or comments..."
                className="min-h-[150px] mt-2"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground">
            No additional configuration available for this node type.
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">{selectedNode.data.label || selectedNode.type}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Separator className="mb-4" />

      {/* Basic Config */}
      <div className="space-y-4 flex-1 min-h-0 overflow-y-auto">
        <div>
          <Label htmlFor="node-name">Name</Label>
          <Input
            id="node-name"
            value={selectedNode.data.label || ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Node name"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="node-description">Description</Label>
          <Input
            id="node-description"
            value={selectedNode.data.description || ''}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Optional description"
            className="mt-2"
          />
        </div>

        <Separator />

        {/* Node-specific configuration */}
        {renderNodeSpecificConfig()}
      </div>

      <Separator className="my-4" />

      {/* Actions */}
      <div className="flex gap-2 flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onDuplicate(selectedNode.id)}
        >
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={() => onDelete(selectedNode.id)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

