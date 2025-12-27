import { useState } from 'react';
import { Puzzle, AlertTriangle, Bug, BarChart3, CheckCircle2, XCircle, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface Extension {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  version: string;
}

const defaultExtensions: Extension[] = [
  {
    id: 'smell-detector',
    name: 'Code Smell Detector',
    description: 'Analyzes code for common smell patterns in React and Node.js',
    icon: <AlertTriangle className="w-5 h-5 text-warning" />,
    enabled: true,
    version: 'v2.1.0',
  },
  {
    id: 'bug-classifier',
    name: 'Bug Classifier ML Engine',
    description: 'Machine learning model for predicting bug categories',
    icon: <Bug className="w-5 h-5 text-destructive" />,
    enabled: true,
    version: 'v1.5.2',
  },
  {
    id: 'static-analysis',
    name: 'Static Analysis Toolkit',
    description: 'Extracts metrics like LOC, complexity, and coupling',
    icon: <BarChart3 className="w-5 h-5 text-primary" />,
    enabled: true,
    version: 'v3.0.1',
  },
];

export function ExtensionsPanel() {
  const [extensions, setExtensions] = useState(defaultExtensions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  const toggleExtension = (id: string) => {
    setExtensions((prev) =>
      prev.map((ext) =>
        ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
      )
    );
  };

  const filteredExtensions = extensions.filter((ext) => {
    const matchesSearch = ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'enabled' && ext.enabled) ||
                          (filter === 'disabled' && !ext.enabled);
    return matchesSearch && matchesFilter;
  });

  const enabledCount = extensions.filter(e => e.enabled).length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with Search */}
      <div className="p-3 space-y-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Puzzle className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Extensions
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {enabledCount}/{extensions.length}
            </span>
            <button 
              className="p-1 rounded hover:bg-secondary transition-colors"
              title="Refresh extensions"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search extensions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/50 border border-border rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-0.5 bg-secondary/30 rounded-md">
          {(['all', 'enabled', 'disabled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 px-2 py-1 text-[10px] font-medium rounded transition-all ${
                filter === f 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Extensions List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        {filteredExtensions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <SlidersHorizontal className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No extensions found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExtensions.map((ext) => (
              <div
                key={ext.id}
                className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                  ext.enabled
                    ? 'bg-card border-border hover:border-primary/30'
                    : 'bg-secondary/30 border-border/50 opacity-70'
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Icon - Responsive size */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    {ext.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-medium text-foreground truncate">
                          {ext.name}
                        </h4>
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                          {ext.version}
                        </span>
                      </div>
                      
                      {/* Toggle Switch */}
                      <button
                        onClick={() => toggleExtension(ext.id)}
                        className={`w-7 h-4 sm:w-8 sm:h-5 rounded-full transition-colors relative shrink-0 ${
                          ext.enabled ? 'bg-success' : 'bg-muted'
                        }`}
                        title={ext.enabled ? 'Disable' : 'Enable'}
                      >
                        <span
                          className={`absolute top-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white shadow transition-transform ${
                            ext.enabled ? 'left-3.5 sm:left-3.5' : 'left-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    
                    {/* Description - Hidden on very small */}
                    <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {ext.description}
                    </p>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                      {ext.enabled ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-success" />
                          <span className="text-[9px] sm:text-[10px] text-success font-medium">Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[9px] sm:text-[10px] text-muted-foreground">Disabled</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Notice */}
      <div className="p-2 sm:p-3 border-t border-border shrink-0">
        <div className="p-2 bg-accent/5 rounded-md border border-accent/20">
          <p className="text-[9px] sm:text-[10px] text-accent text-center">
            Extensions are simulated for academic demonstration
          </p>
        </div>
      </div>
    </div>
  );
}
