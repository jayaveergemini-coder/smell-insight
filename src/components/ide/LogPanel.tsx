import { CheckCircle2, Info, Clock } from 'lucide-react';

interface LogEntry {
  id: number;
  type: 'success' | 'info' | 'pending';
  message: string;
  timestamp: string;
}

interface LogPanelProps {
  logs: LogEntry[];
}

export function LogPanel({ logs }: LogPanelProps) {
  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case 'info':
        return <Info className="w-3.5 h-3.5 text-primary" />;
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse-soft" />;
    }
  };

  return (
    <div className="h-36 bg-log border-t border-border flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-panel-header">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Logs (Simulation)
        </span>
        <span className="text-xs text-muted-foreground">
          {logs.length} entries
        </span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No logs yet. Upload a project to begin.
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={log.id}
              className="log-entry flex items-center gap-2 animate-slide-in-left"
              style={{ animationDelay: `${idx * 30}ms` }}
            >
              {getIcon(log.type)}
              <span className="text-muted-foreground text-xs">
                [{log.timestamp}]
              </span>
              <span className="text-foreground">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export type { LogEntry };
