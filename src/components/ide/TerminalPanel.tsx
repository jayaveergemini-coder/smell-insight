import { CheckCircle2, Loader2, Terminal, Trash2, Download } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'success' | 'info' | 'pending';
  message: string;
  timestamp: string;
}

interface TerminalPanelProps {
  logs: LogEntry[];
  onClear: () => void;
}

export function TerminalPanel({ logs, onClear }: TerminalPanelProps) {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case 'info':
        return <span className="w-3.5 h-3.5 flex items-center justify-center text-primary">›</span>;
      case 'pending':
        return <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin" />;
    }
  };

  return (
    <div className="h-40 bg-log border-t border-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-border bg-panel-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-medium text-foreground">Terminal</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Simulation</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-secondary transition-colors"
            title="Export logs"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin font-mono">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No logs yet. Run analysis to see output.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={log.id}
              className="flex items-start gap-2 px-4 py-1 hover:bg-secondary/30 transition-colors text-xs animate-fade-in"
              style={{ animationDelay: `${idx * 20}ms` }}
            >
              {getIcon(log.type)}
              <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
              <span className="text-foreground">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { LogEntry };
