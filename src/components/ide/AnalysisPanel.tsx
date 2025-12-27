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
} from 'lucide-react';

interface AnalysisPanelProps {
  hasResults: boolean;
  activeTab?: 'smells' | 'features' | 'classification';
  onTabChange?: (tab: 'smells' | 'features' | 'classification') => void;
}

const codeSmells = [
  {
    name: 'Long Methods',
    count: 7,
    severity: 'high' as const,
    icon: Code2,
    description: 'Methods exceeding 50 lines of code',
  },
  {
    name: 'Large Classes',
    count: 3,
    severity: 'medium' as const,
    icon: Layers,
    description: 'Classes with too many responsibilities',
  },
  {
    name: 'Duplicate Code',
    count: 12,
    severity: 'high' as const,
    icon: Copy,
    description: 'Similar code blocks detected',
  },
  {
    name: 'Complex Conditionals',
    count: 5,
    severity: 'medium' as const,
    icon: GitBranch,
    description: 'Deeply nested or complex logic',
  },
];

const featureDataset = [
  { feature: 'Lines of Code (LOC)', value: '2,847' },
  { feature: 'Cyclomatic Complexity', value: '156' },
  { feature: 'Long Method Count', value: '7' },
  { feature: 'Duplicate Code %', value: '18.3%' },
  { feature: 'Large Class Count', value: '3' },
  { feature: 'Deep Nesting Level', value: '4' },
  { feature: 'Comment Ratio', value: '12.5%' },
  { feature: 'Coupling Score', value: '0.67' },
];

const bugCategories = [
  { category: 'Logic Error', probability: 42 },
  { category: 'Null Reference', probability: 28 },
  { category: 'Resource Leak', probability: 18 },
  { category: 'Concurrency', probability: 12 },
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

export function AnalysisPanel({ hasResults, activeTab: propActiveTab, onTabChange }: AnalysisPanelProps) {
  const activeTab = propActiveTab || 'smells';
  const setActiveTab = onTabChange || (() => {});

  if (!hasResults) {
    return (
      <aside className="w-80 bg-panel border-l border-border flex flex-col">
        <div className="ide-panel-header">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Analysis Results
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-secondary rounded-2xl flex items-center justify-center mb-4">
              <Bug className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Run analysis to see results
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
            { id: 'smells', label: 'Code Smells' },
            { id: 'features', label: 'Features' },
            { id: 'classification', label: 'Classification' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`tab-button flex-1 ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {activeTab === 'smells' && (
          <div className="space-y-3 animate-fade-in">
            {codeSmells.map((smell, idx) => (
              <div
                key={idx}
                className="result-card"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <smell.icon className="w-5 h-5 text-foreground" />
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

        {activeTab === 'features' && (
          <div className="animate-fade-in">
            <div className="bg-secondary/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                These features are used by ML models for classification
              </p>
            </div>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                      Feature
                    </th>
                    <th className="text-right px-3 py-2 font-medium text-muted-foreground">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureDataset.map((row, idx) => (
                    <tr
                      key={idx}
                      className="border-t border-border hover:bg-secondary/30"
                    >
                      <td className="px-3 py-2.5 text-foreground">
                        {row.feature}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-primary font-medium">
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
                    Logic Error
                  </h3>
                </div>
              </div>
              <div className="flex items-center justify-between bg-background/60 rounded-lg p-3">
                <span className="text-sm text-muted-foreground">
                  Confidence
                </span>
                <span className="text-lg font-bold text-primary">87.3%</span>
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
                      <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${bug.probability}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground w-10 text-right">
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
                        level <= 4 ? 'bg-warning' : 'bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-warning">
                  High Risk
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
