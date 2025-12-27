import { useState } from 'react';
import { Puzzle, AlertTriangle, Bug, BarChart3, CheckCircle2, XCircle } from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

const defaultExtensions: Extension[] = [
  {
    id: 'smell-detector',
    name: 'Code Smell Detector',
    description: 'Analyzes code for common smell patterns in React and Node.js',
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    enabled: true,
  },
  {
    id: 'bug-classifier',
    name: 'Bug Classifier ML Engine',
    description: 'Machine learning model for predicting bug categories',
    icon: <Bug className="w-5 h-5 text-destructive" />,
    enabled: true,
  },
  {
    id: 'static-analysis',
    name: 'Static Analysis Toolkit',
    description: 'Extracts metrics like LOC, complexity, and coupling',
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    enabled: true,
  },
];

export function ExtensionsPanel() {
  const [extensions, setExtensions] = useState(defaultExtensions);

  const toggleExtension = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-4">
          <Puzzle className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Installed Extensions
          </span>
        </div>

        <div className="space-y-3">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className={`p-3 rounded-lg border transition-all ${
                ext.enabled
                  ? 'bg-card border-border'
                  : 'bg-secondary/30 border-border/50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {ext.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{ext.name}</h4>
                    <button
                      onClick={() => toggleExtension(ext.id)}
                      className={`w-8 h-5 rounded-full transition-colors relative ${
                        ext.enabled ? 'bg-success' : 'bg-muted'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          ext.enabled ? 'left-3.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ext.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {ext.enabled ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span className="text-[10px] text-success">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">Disabled</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-border mt-auto">
        <div className="p-2 bg-accent/5 rounded-md border border-accent/20">
          <p className="text-[10px] text-accent text-center">
            Extensions are simulated for academic demonstration
          </p>
        </div>
      </div>
    </div>
  );
}
