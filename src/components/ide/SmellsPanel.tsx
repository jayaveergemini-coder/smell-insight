import { Monitor, Server, AlertTriangle, Code2, Layers, Copy, GitBranch, Component, Braces, Repeat } from 'lucide-react';

interface SmellItem {
  name: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  icon: React.ReactNode;
}

interface SmellsPanelProps {
  hasResults: boolean;
}

const frontendSmells: SmellItem[] = [
  { name: 'Large React Components', count: 5, severity: 'high', icon: <Component className="w-4 h-4" /> },
  { name: 'High JSX Complexity', count: 8, severity: 'medium', icon: <Braces className="w-4 h-4" /> },
  { name: 'Duplicate UI Logic', count: 4, severity: 'medium', icon: <Repeat className="w-4 h-4" /> },
  { name: 'Missing PropTypes', count: 12, severity: 'low', icon: <AlertTriangle className="w-4 h-4" /> },
];

const backendSmells: SmellItem[] = [
  { name: 'Long Methods', count: 7, severity: 'high', icon: <Code2 className="w-4 h-4" /> },
  { name: 'High Cyclomatic Complexity', count: 4, severity: 'high', icon: <GitBranch className="w-4 h-4" /> },
  { name: 'Duplicate Business Logic', count: 6, severity: 'medium', icon: <Copy className="w-4 h-4" /> },
  { name: 'Large Controllers', count: 3, severity: 'medium', icon: <Layers className="w-4 h-4" /> },
];

function getSeverityClass(severity: 'low' | 'medium' | 'high') {
  switch (severity) {
    case 'low': return 'bg-success/15 text-success';
    case 'medium': return 'bg-warning/15 text-warning';
    case 'high': return 'bg-destructive/15 text-destructive';
  }
}

function SmellCategory({ title, icon, smells, color }: { 
  title: string; 
  icon: React.ReactNode; 
  smells: SmellItem[];
  color: string;
}) {
  return (
    <div className="mb-4">
      <div className={`flex items-center gap-2 px-3 py-2 ${color} rounded-t-md`}>
        {icon}
        <span className="text-xs font-semibold">{title}</span>
        <span className="ml-auto text-[10px] font-mono">
          {smells.reduce((sum, s) => sum + s.count, 0)} issues
        </span>
      </div>
      <div className="border border-t-0 border-border rounded-b-md divide-y divide-border">
        {smells.map((smell, idx) => (
          <div key={idx} className="px-3 py-2 flex items-center gap-2">
            <span className="text-muted-foreground">{smell.icon}</span>
            <span className="text-xs text-foreground flex-1">{smell.name}</span>
            <span className="text-xs font-mono font-medium text-foreground">{smell.count}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getSeverityClass(smell.severity)}`}>
              {smell.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SmellsPanel({ hasResults }: SmellsPanelProps) {
  if (!hasResults) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No Analysis Yet</p>
          <p className="text-xs text-muted-foreground">
            Run analysis to detect code smells
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
      <SmellCategory
        title="Frontend Smells"
        icon={<Monitor className="w-4 h-4" />}
        smells={frontendSmells}
        color="bg-primary/10 text-primary"
      />
      <SmellCategory
        title="Backend Smells"
        icon={<Server className="w-4 h-4" />}
        smells={backendSmells}
        color="bg-success/10 text-success"
      />
      
      <div className="mt-4 p-3 bg-secondary/30 rounded-md">
        <p className="text-[10px] text-muted-foreground text-center">
          Code smell detection is simulated for demonstration
        </p>
      </div>
    </div>
  );
}
