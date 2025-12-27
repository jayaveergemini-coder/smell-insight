import {
  Bug,
  TrendingUp,
  Shield,
  FileDown,
  FileText,
  Monitor,
  Server,
  AlertTriangle,
  Database,
  BarChart3,
  Minus,
  X,
} from 'lucide-react';

interface ResultsPanelProps {
  hasResults: boolean;
  activeTab: 'summary' | 'features' | 'classification';
  onTabChange: (tab: 'summary' | 'features' | 'classification') => void;
  onMinimize?: () => void;
  onClose?: () => void;
  isMinimized?: boolean;
}

const smellSummary = [
  { category: 'Frontend', smells: 29, high: 5, medium: 12, low: 12, icon: Monitor, color: 'primary' },
  { category: 'Backend', smells: 20, high: 11, medium: 6, low: 3, icon: Server, color: 'success' },
];

const featureDataset = [
  { feature: 'Total LOC', value: '2,871', type: 'metric' },
  { feature: 'Frontend LOC', value: '1,847', type: 'frontend' },
  { feature: 'Backend LOC', value: '1,024', type: 'backend' },
  { feature: 'Avg. Complexity', value: '8.4', type: 'metric' },
  { feature: 'Max Complexity', value: '24', type: 'metric' },
  { feature: 'Component Count', value: '23', type: 'frontend' },
  { feature: 'API Routes', value: '12', type: 'backend' },
  { feature: 'Duplication %', value: '14.2%', type: 'metric' },
];

const bugCategories = [
  { category: 'State Management Error', probability: 38 },
  { category: 'API Integration Bug', probability: 32 },
  { category: 'Logic Error', probability: 18 },
  { category: 'Null Reference', probability: 12 },
];

export function ResultsPanel({ hasResults, activeTab, onTabChange, onMinimize, onClose, isMinimized }: ResultsPanelProps) {
  if (isMinimized) {
    return (
      <aside className="h-full bg-panel border-l border-border flex flex-col w-10">
        <div className="flex flex-col items-center py-2 gap-2">
          <button
            onClick={onMinimize}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Expand"
          >
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </aside>
    );
  }

  if (!hasResults) {
    return (
      <aside className="h-full bg-panel border-l border-border flex flex-col">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analysis Results
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onMinimize}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No Results Yet</p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-40 mx-auto">
              Run analysis to see smell summary, features, and classifications
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="h-full bg-panel border-l border-border flex flex-col">
      {/* Header with controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Results
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Minimize"
          >
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-secondary transition-colors"
            title="Close"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {[
          { id: 'summary', label: 'Summary', icon: AlertTriangle },
          { id: 'features', label: 'Features', icon: Database },
          { id: 'classification', label: 'Bugs', icon: Bug },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {activeTab === 'summary' && (
          <div className="space-y-3 animate-fade-in">
            {smellSummary.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <item.icon className={`w-4 h-4 text-${item.color}`} />
                  <span className="text-sm font-medium text-foreground">{item.category}</span>
                  <span className="ml-auto text-lg font-bold text-foreground">{item.smells}</span>
                </div>
                <div className="flex gap-2">
                  <span className="flex-1 text-center py-1.5 rounded bg-destructive/10 text-destructive text-xs">
                    {item.high} High
                  </span>
                  <span className="flex-1 text-center py-1.5 rounded bg-warning/10 text-warning text-xs">
                    {item.medium} Med
                  </span>
                  <span className="flex-1 text-center py-1.5 rounded bg-success/10 text-success text-xs">
                    {item.low} Low
                  </span>
                </div>
              </div>
            ))}
            <div className="p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Total Issues</span>
                <span className="text-xl font-bold text-foreground">49</span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="animate-fade-in">
            <div className="p-2 mb-3 bg-secondary/30 rounded-md">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Features used by ML model for classification
              </p>
            </div>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">Feature</th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {featureDataset.map((row, idx) => (
                    <tr key={idx} className="border-t border-border hover:bg-secondary/30">
                      <td className="px-3 py-2 text-foreground flex items-center gap-2">
                        {row.type === 'frontend' && <Monitor className="w-3 h-3 text-primary" />}
                        {row.type === 'backend' && <Server className="w-3 h-3 text-success" />}
                        {row.type === 'metric' && <BarChart3 className="w-3 h-3 text-muted-foreground" />}
                        {row.feature}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-medium text-primary">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'classification' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                  <Bug className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Predicted</p>
                  <h3 className="text-sm font-bold text-foreground">State Management Error</h3>
                </div>
              </div>
              <div className="flex items-center justify-between bg-background/50 rounded-md p-2">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-lg font-bold text-primary">84.7%</span>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Other Possibilities
              </h4>
              {bugCategories.slice(1).map((bug, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-xs text-foreground">{bug.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-primary/50 rounded-full" style={{ width: `${bug.probability}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-7 text-right">
                      {bug.probability}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg border border-warning/30 bg-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-xs font-medium text-foreground">Risk Level</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className={`w-5 h-1.5 rounded-sm ${level <= 3 ? 'bg-warning' : 'bg-border'}`} />
                  ))}
                </div>
                <span className="text-xs font-medium text-warning">Medium</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2 shrink-0">
        <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          View Full Report
        </button>
        <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border border-border hover:bg-secondary transition-colors">
          <FileDown className="w-3.5 h-3.5" />
          Export PDF
        </button>
      </div>
    </aside>
  );
}
