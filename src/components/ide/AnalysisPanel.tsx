import {
  AlertTriangle,
  Code2,
  Copy,
  GitBranch,
  Layers,
  Bug,
  TrendingUp,
  Shield,
  FileDown,
  FileText,
  Monitor,
  Server,
  Component,
  Braces,
  Repeat,
  Activity,
} from 'lucide-react';

interface AnalysisPanelProps {
  hasResults: boolean;
  activeTab?: 'frontend' | 'backend' | 'classification';
  onTabChange?: (tab: 'frontend' | 'backend' | 'classification') => void;
  hasFrontend?: boolean;
  hasBackend?: boolean;
}

const frontendSmells = [
  {
    name: 'Large Components',
    count: 5,
    severity: 'high' as const,
    icon: Component,
    description: 'Components exceeding 300 lines of JSX',
  },
  {
    name: 'High JSX Complexity',
    count: 8,
    severity: 'medium' as const,
    icon: Braces,
    description: 'Deeply nested JSX structures',
  },
  {
    name: 'Duplicate UI Logic',
    count: 4,
    severity: 'medium' as const,
    icon: Repeat,
    description: 'Similar component patterns detected',
  },
  {
    name: 'Missing PropTypes',
    count: 12,
    severity: 'low' as const,
    icon: AlertTriangle,
    description: 'Components without type definitions',
  },
];

const backendSmells = [
  {
    name: 'Long Methods',
    count: 7,
    severity: 'high' as const,
    icon: Code2,
    description: 'Functions exceeding 50 lines',
  },
  {
    name: 'High Cyclomatic Complexity',
    count: 4,
    severity: 'high' as const,
    icon: GitBranch,
    description: 'Complex branching logic detected',
  },
  {
    name: 'Duplicate Business Logic',
    count: 6,
    severity: 'medium' as const,
    icon: Copy,
    description: 'Similar code patterns in services',
  },
  {
    name: 'Large Controllers',
    count: 3,
    severity: 'medium' as const,
    icon: Layers,
    description: 'Controllers with too many routes',
  },
];

const featureDataset = [
  { feature: 'Frontend LOC', value: '1,847', category: 'frontend' },
  { feature: 'Backend LOC', value: '1,024', category: 'backend' },
  { feature: 'Component Count', value: '23', category: 'frontend' },
  { feature: 'API Routes', value: '12', category: 'backend' },
  { feature: 'Avg. Complexity', value: '8.4', category: 'both' },
  { feature: 'Duplication %', value: '14.2%', category: 'both' },
];

const bugCategories = [
  { category: 'State Management Error', probability: 38 },
  { category: 'API Integration Bug', probability: 32 },
  { category: 'Logic Error', probability: 18 },
  { category: 'Null Reference', probability: 12 },
];

function getSeverityClass(severity: 'low' | 'medium' | 'high') {
  switch (severity) {
    case 'low':
      return 'severity-low';
    case 'medium':
      return 'severity-medium';
    case 'high':
      return 'severity-high';
  }
}

export function AnalysisPanel({ 
  hasResults, 
  activeTab: propActiveTab, 
  onTabChange,
  hasFrontend = true,
  hasBackend = true,
}: AnalysisPanelProps) {
  const activeTab = propActiveTab || 'frontend';
  const setActiveTab = onTabChange || (() => {});

  if (!hasResults) {
    return (
      <aside className="w-96 bg-panel border-l border-border flex flex-col">
        <div className="ide-panel-header">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analysis Results
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Activity className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Ready for Analysis
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-48 mx-auto">
              Upload a React + Backend project and run analysis to see results
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-panel border-l border-border flex flex-col">
      <div className="border-b border-border">
        <div className="flex">
          {[
            { id: 'frontend', label: 'Frontend Smells', icon: Monitor, disabled: !hasFrontend },
            { id: 'backend', label: 'Backend Smells', icon: Server, disabled: !hasBackend },
            { id: 'classification', label: 'Classification', icon: Bug, disabled: false },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as typeof activeTab)}
              disabled={tab.disabled}
              className={`tab-button flex-1 flex items-center justify-center gap-1.5 ${
                activeTab === tab.id ? 'active' : ''
              } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span className="text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {activeTab === 'frontend' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Monitor className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">React Frontend Analysis</span>
            </div>
            {frontendSmells.map((smell, idx) => (
              <div
                key={idx}
                className="result-card"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <smell.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {smell.name}
                      </h4>
                      <span className={`severity-badge ${getSeverityClass(smell.severity)}`}>
                        {smell.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {smell.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      <span className="text-sm font-semibold text-foreground">
                        {smell.count} instances
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'backend' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Server className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-foreground">Node.js Backend Analysis</span>
            </div>
            {backendSmells.map((smell, idx) => (
              <div
                key={idx}
                className="result-card"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                    <smell.icon className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground">
                        {smell.name}
                      </h4>
                      <span className={`severity-badge ${getSeverityClass(smell.severity)}`}>
                        {smell.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {smell.description}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                      <span className="text-sm font-semibold text-foreground">
                        {smell.count} instances
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'classification' && (
          <div className="space-y-4 animate-fade-in">
            <div className="result-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Bug className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Predicted Bug Type
                  </p>
                  <h3 className="text-lg font-bold text-foreground">
                    State Management Error
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between bg-background/60 rounded-lg p-3">
                <span className="text-sm text-muted-foreground">
                  Confidence
                </span>
                <span className="text-lg font-bold text-primary">84.7%</span>
              </div>
            </div>

            <div className="result-card">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Feature Summary
              </h4>
              <div className="space-y-2">
                {featureDataset.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      {item.category === 'frontend' && <Monitor className="w-3 h-3 text-primary" />}
                      {item.category === 'backend' && <Server className="w-3 h-3 text-success" />}
                      {item.category === 'both' && <TrendingUp className="w-3 h-3 text-accent" />}
                      <span className="text-sm text-foreground">{item.feature}</span>
                    </div>
                    <span className="text-sm font-mono font-medium text-primary">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Other Possibilities
              </h4>
              <div className="space-y-2">
                {bugCategories.slice(1).map((bug, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <span className="text-sm text-foreground">{bug.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${bug.probability}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                        {bug.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-card border-warning/30 bg-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium text-foreground">
                  Risk Level
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-6 h-2 rounded-sm ${
                        level <= 3 ? 'bg-warning' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-warning">
                  Medium Risk
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {hasResults && (
        <div className="p-4 border-t border-border space-y-2">
          <button className="action-button w-full justify-center">
            <FileText className="w-4 h-4" />
            View Summary Report
          </button>
          <button className="action-button-secondary w-full justify-center">
            <FileDown className="w-4 h-4" />
            Download PDF Report
          </button>
        </div>
      )}
    </aside>
  );
}
